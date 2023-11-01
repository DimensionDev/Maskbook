import { decodeArrayBuffer, encodeArrayBuffer, isNonNull, unreachable } from '@masknet/kit'
import {
    type DecryptStaticECDH_PostKey,
    type DecryptEphemeralECDH_PostKey,
    type EncryptionResultE2EMap,
    EncryptPayloadNetwork,
    EC_KeyCurve,
    importEC_Key,
    getEcKeyCurve,
} from '@masknet/encryption'
import type { EC_Public_CryptoKey, EC_Public_JsonWebKey } from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../../utils-pure/index.js'
import * as gun_utils from /* webpackDefer: true */ '@masknet/gun-utils'
import { EventIterator } from 'event-iterator'
import { isObject, noop, uniq } from 'lodash-es'

// !!! Change how this file access Gun will break the compatibility of v40 payload decryption.
export async function GUN_queryPostKey_version40(
    iv: Uint8Array,
    whoAmI: string,
): Promise<null | DecryptStaticECDH_PostKey> {
    // PATH ON GUN: maskbook > posts > iv > userID
    const result = await gun_utils.getGunData('maskbook', 'posts', encodeArrayBuffer(iv), whoAmI)
    if (!isValidData(result)) return null
    return {
        encryptedPostKey: new Uint8Array(decodeArrayBuffer(result.encryptedKey)),
        postKeyIV: new Uint8Array(decodeArrayBuffer(result.salt)),
    }

    type DataOnGun = {
        encryptedKey: string
        salt: string
    }
    function isValidData(x: typeof result): x is DataOnGun {
        if (typeof x !== 'object') return false
        if (!x) return false

        const { encryptedKey, salt: encryptedKeyIV } = x
        if (typeof encryptedKey !== 'string' || typeof encryptedKeyIV !== 'string') return false
        return true
    }
}

namespace Version38Or39 {
    export async function* GUN_queryPostKey_version39Or38(
        version: -38 | -39,
        iv: Uint8Array,
        minePublicKey: EC_Public_CryptoKey,
        network: EncryptPayloadNetwork,
        abortSignal: AbortSignal,
    ): AsyncGenerator<DecryptStaticECDH_PostKey, void, undefined> {
        const minePublicKeyJWK = await CryptoKeyToJsonWebKey(minePublicKey)
        const { keyHash, postHash } = await calculatePostKeyPartition(version, network, iv, minePublicKeyJWK)

        /* cspell:disable-next-line */
        // ? In this step we get something like ["jzarhbyjtexiE7aB1DvQ", "jzarhuse6xlTAtblKRx9"]
        console.log(
            `[@masknet/encryption] Reading key partition [${postHash[0]}][${keyHash}] and [${postHash[1]}][${keyHash}]`,
        )
        const internalNodeNames = uniq(
            (
                await Promise.all([
                    //
                    gun_utils.getGunData(postHash[0], keyHash),
                    gun_utils.getGunData(postHash[1], keyHash),
                ])
            )
                .filter(isNonNull)
                .filter(isObject)
                .map(Object.keys)
                .flat()
                .filter((x) => x !== '_'),
        )
        // ? In this step we get all keys in this category (gun2[postHash][keyHash])
        const resultPromise = internalNodeNames.map((key) => gun_utils.getGunData(key))

        const iter = new EventIterator<DecryptStaticECDH_PostKey>((queue) => {
            // immediate results
            for (const result of resultPromise) result.then(emit, noop)
            // future results
            Promise.all([
                main(gun_utils.subscribeGunMapData([postHash[1]], isValidData, abortSignal)),
                main(gun_utils.subscribeGunMapData([postHash[0]], isValidData, abortSignal)),
            ]).then(() => queue.stop())

            async function main(keyProvider: AsyncGenerator) {
                for await (const data of keyProvider) Promise.resolve(data).then(emit, noop)
            }
            function emit(result: unknown) {
                if (abortSignal.aborted) return
                if (!isValidData(result)) return
                queue.push({
                    encryptedPostKey: new Uint8Array(decodeArrayBuffer(result.encryptedKey)),
                    postKeyIV: new Uint8Array(decodeArrayBuffer(result.salt)),
                })
            }
        })
        yield* iter
    }

    /**
     * Publish post keys on the gun
     * @param version current payload
     * @param postIV Post iv
     * @param receiversKeys Keys needs to publish
     */
    export async function publishPostAESKey_version39Or38(
        version: -39 | -38,
        postIV: Uint8Array,
        network: EncryptPayloadNetwork,
        receiversKeys: EncryptionResultE2EMap,
    ) {
        const [postHash] = await hashIV(network, postIV)
        if (version === -39) throw new Error('unreachable')
        for (const result of receiversKeys.values()) {
            try {
                if (result.status === 'rejected') continue
                const { encryptedPostKey, target, ivToBePublished } = result.value
                if (!ivToBePublished) throw new Error('Missing salt')
                const jwk = await CryptoKeyToJsonWebKey(target.key)
                const keyHash = await hashKey38(jwk)
                const post: DataOnGun = {
                    encryptedKey: encodeArrayBuffer(encryptedPostKey),
                    salt: encodeArrayBuffer(ivToBePublished),
                }
                console.log(`gun[${postHash}][${keyHash}].push(`, post, ')')
                gun_utils.pushToGunDataArray([postHash, keyHash], post)
            } catch (error) {
                console.error('[@masknet/encryption] An error occurs when sending E2E keys', error)
            }
        }
    }

    type DataOnGun = {
        encryptedKey: string
        salt: string
    }

    function isValidData(data: unknown): data is DataOnGun {
        if (!data) return false
        if (typeof data !== 'object') return false
        const { encryptedKey, salt } = data as DataOnGun
        if (typeof encryptedKey !== 'string') return false
        if (typeof salt !== 'string') return false
        return true
    }

    async function calculatePostKeyPartition(
        version: -38 | -39,
        network: EncryptPayloadNetwork,
        iv: Uint8Array,
        key: EC_Public_JsonWebKey,
    ) {
        const postHash = await hashIV(network, iv)
        // In version > -39, we will use stable hash to prevent unstable result for key hashing

        const keyHash = version === -39 ? await hashKey39(key) : await hashKey38(key)
        return { postHash, keyHash }
    }

    async function hashIV(network: EncryptPayloadNetwork, iv: Uint8Array): Promise<[string, string]> {
        const hashPair = '9283464d-ee4e-4e8d-a7f3-cf392a88133f'
        const N = 2

        const hash = (await GUN_SEA_work(encodeArrayBuffer(iv), hashPair)).slice(0, N)
        const networkHint = getNetworkHint(network)
        return [`${networkHint}${hash}`, `${networkHint}-${hash}`]
    }

    function getNetworkHint(x: EncryptPayloadNetwork) {
        if (x === EncryptPayloadNetwork.Facebook) return ''
        if (x === EncryptPayloadNetwork.Twitter) return 'twitter-'
        if (x === EncryptPayloadNetwork.Minds) return 'minds-'
        if (x === EncryptPayloadNetwork.Instagram) return 'instagram-'
        if (x === EncryptPayloadNetwork.Unknown)
            throw new TypeError('[@masknet/encryption] Current network is not correctly configured.')
        unreachable(x)
    }

    // The difference between V38 and V39 is: V39 is not stable (JSON.stringify)
    // it's an implementation bug but for backward compatibility, it cannot be changed.
    // Therefore we upgraded the version and use a stable hash.
    async function hashKey39(key: EC_Public_JsonWebKey) {
        const hashPair = '10198a2f-205f-45a6-9987-3488c80113d0'
        const N = 2

        const jwk = JSON.stringify(key)
        const hash = await GUN_SEA_work(jwk, hashPair)
        return hash.slice(0, N)
    }

    async function hashKey38(jwk: EC_Public_JsonWebKey) {
        const hashPair = '10198a2f-205f-45a6-9987-3488c80113d0'
        const N = 2

        const hash = await GUN_SEA_work(jwk.x! + jwk.y!, hashPair)
        return hash.slice(0, N)
    }
}

// This is a self contained Gun.SEA.work implementation that only contains code path we used.
async function GUN_SEA_work(data: Uint8Array | string, salt: Uint8Array | string) {
    if (typeof data === 'string') data = new TextEncoder().encode(data)
    if (typeof salt === 'string') salt = new TextEncoder().encode(salt)
    const key = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits'])
    const params: Pbkdf2Params = { name: 'PBKDF2', iterations: 100000, salt, hash: { name: 'SHA-256' } }
    const derived = await crypto.subtle.deriveBits(params, key, 512)
    return btoa(String.fromCharCode(...new Uint8Array(derived)))
}

namespace Version37 {
    export async function* GUN_queryPostKey_version37(
        iv: Uint8Array,
        minePublicKey: EC_Public_CryptoKey,
        network: EncryptPayloadNetwork,
        abortSignal: AbortSignal,
    ): AsyncGenerator<DecryptEphemeralECDH_PostKey, void, undefined> {
        const minePublicKeyJWK = await CryptoKeyToJsonWebKey(minePublicKey)
        const { keyHash, postHash, networkHint } = await calculatePostKeyPartition(network, iv, minePublicKeyJWK)

        /* cspell:disable-next-line */
        // ? In this step we get something like ["jzarhbyjtexiE7aB1DvQ", "jzarhuse6xlTAtblKRx9"]
        const keyPartition = `${networkHint}-${postHash}-${keyHash}`
        console.log(`[@masknet/encryption] Reading key partition [${keyPartition}]`)
        const internalNodeNames = await gun_utils.getGunData(keyPartition).then((x) => {
            if (!x) return []
            if (typeof x !== 'object') return []
            return Object.keys(x)
        })
        // ? In this step we get all keys in this category (gun2[keyPartition])
        const resultPromise = internalNodeNames.map((key) => gun_utils.getGunData(key))

        const iter = new EventIterator<DecryptEphemeralECDH_PostKey>((queue) => {
            // immediate results
            for (const result of resultPromise) result.then(emit, noop)

            // future results
            main(gun_utils.subscribeGunMapData([keyPartition], isValidData, abortSignal))

            async function main(keyProvider: AsyncGenerator) {
                for await (const data of keyProvider) Promise.resolve(data).then(emit, noop)
                queue.stop()
            }
            async function emit(result: unknown) {
                if (abortSignal.aborted) return
                if (!isValidData(result)) return

                const data: DecryptEphemeralECDH_PostKey = {
                    encryptedPostKey: new Uint8Array(decodeArrayBuffer(result.e)),
                }
                if (result.k && result.c) {
                    data.ephemeralPublicKey = (
                        await importEC_Key(new Uint8Array(decodeArrayBuffer(result.k)), result.c)
                    ).unwrap()
                }
                queue.push(data)
            }
        })
        yield* iter
    }

    /**
     * Publish post keys on the gun
     * @param postIV Post iv
     * @param receiversKeys Keys needs to publish
     */
    export async function publishPostAESKey_version37(
        postIV: Uint8Array,
        network: EncryptPayloadNetwork,
        receiversKeys: EncryptionResultE2EMap,
    ) {
        const networkPartition = getNetworkPartition(network)
        const postHash = await hashIV(postIV)
        for (const result of receiversKeys.values()) {
            try {
                if (result.status === 'rejected') continue
                const { encryptedPostKey, target, ephemeralPublicKey } = result.value
                const jwk = await CryptoKeyToJsonWebKey(target.key)
                const keyPartition = `${networkPartition}-${postHash}-${await hashKey(jwk)}`
                const post: DataOnGun = {
                    e: encodeArrayBuffer(encryptedPostKey),
                }
                if (ephemeralPublicKey) {
                    post.c = getEcKeyCurve(ephemeralPublicKey)
                    post.k = encodeArrayBuffer(new Uint8Array(await crypto.subtle.exportKey('raw', ephemeralPublicKey)))
                }
                console.log(`[@masknet/encryption] gun[${keyPartition}].push(`, post, ')')
                gun_utils.pushToGunDataArray([keyPartition], post)
            } catch (error) {
                console.error('[@masknet/encryption] An error occurs when sending E2E keys', error)
            }
        }
    }

    // we need to make it short, but looks like gun does not support storing Uint8Array?
    type DataOnGun = {
        /** encrypted key */
        e: string
        /** ephemeral public key chain */
        c?: EC_KeyCurve
        /** ephemeral public key */
        k?: string
    }

    function isValidData(data: unknown): data is DataOnGun {
        if (!data) return false
        if (typeof data !== 'object') return false
        const { e, c, k } = data as DataOnGun
        if (typeof e !== 'string') return false
        if (![EC_KeyCurve.secp256k1, EC_KeyCurve.secp256p1, undefined].includes(c)) return false
        if (typeof k !== 'string' && k !== undefined) return false
        return true
    }

    async function calculatePostKeyPartition(
        network: EncryptPayloadNetwork,
        iv: Uint8Array,
        key: EC_Public_JsonWebKey,
    ) {
        const postHash = await hashIV(iv)
        const keyHash = await hashKey(key)
        return { postHash, keyHash, networkHint: getNetworkPartition(network) }
    }

    async function hashIV(iv: Uint8Array): Promise<string> {
        const hashPair = '9283464d-ee4e-4e8d-a7f3-cf392a88133f'
        const N = 2

        return (await GUN_SEA_work(encodeArrayBuffer(iv), hashPair)).slice(0, N)
    }

    async function hashKey(jwk: EC_Public_JsonWebKey) {
        const hashPair = 'ace7ab0c-5507-4bdd-9d43-e4249a48e720'
        const N = 2

        const hash = await GUN_SEA_work(jwk.x! + jwk.y!, hashPair)
        return hash.slice(0, N)
    }

    function getNetworkPartition(x: EncryptPayloadNetwork) {
        if (x === EncryptPayloadNetwork.Facebook) return '37-fb'
        if (x === EncryptPayloadNetwork.Twitter) return '37-tw'
        if (x === EncryptPayloadNetwork.Minds) return '37-minds'
        if (x === EncryptPayloadNetwork.Instagram) return '37-ins'
        if (x === EncryptPayloadNetwork.Unknown)
            throw new TypeError('[@masknet/encryption] Current network is not correctly configured.')
        unreachable(x)
    }
}

export const { GUN_queryPostKey_version39Or38, publishPostAESKey_version39Or38 } = Version38Or39
export const { GUN_queryPostKey_version37, publishPostAESKey_version37 } = Version37
