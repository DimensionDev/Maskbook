import { decodeArrayBuffer, encodeArrayBuffer, isNonNull, unreachable } from '@dimensiondev/kit'
import { type DecryptStaticECDH_PostKey, type EncryptionResultE2EMap, SocialNetworkEnum } from '@masknet/encryption'
import type { EC_Public_CryptoKey, EC_Public_JsonWebKey } from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../../../../utils-pure'
import { getGunData, pushToGunDataArray, subscribeGunMapData } from '@masknet/gun-utils'
import { EventIterator } from 'event-iterator'
import { isObject, noop, uniq } from 'lodash-unified'
import { queryPublicKey } from '../../../database/persona/helper'

// !!! Change how this file access Gun will break the compatibility of v40 payload decryption.
export async function GUN_queryPostKey_version40(
    iv: Uint8Array,
    whoAmI: string,
): Promise<null | DecryptStaticECDH_PostKey> {
    // PATH ON GUN: maskbook > posts > iv > userID
    const result = await getGunData('maskbook', 'posts', encodeArrayBuffer(iv), whoAmI)
    if (!isValidData(result)) return null
    return {
        encryptedPostKey: new Uint8Array(decodeArrayBuffer(result.encryptedKey)),
        postKeyIV: new Uint8Array(decodeArrayBuffer(result.salt)),
    }

    type DataOnGun = { encryptedKey: string; salt: string }
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
        network: SocialNetworkEnum,
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
                    getGunData(postHash[0], keyHash),
                    getGunData(postHash[1], keyHash),
                ])
            )
                .filter(isNonNull)
                .filter(isObject)
                .map(Object.keys)
                .flat()
                .filter((x) => x !== '_'),
        )
        // ? In this step we get all keys in this category (gun2[postHash][keyHash])
        const resultPromise = internalNodeNames.map((key) => getGunData(key))

        const iter = new EventIterator<DecryptStaticECDH_PostKey>((queue) => {
            // immediate results
            for (const result of resultPromise) result.then(emit, noop)
            // future results
            Promise.all([
                main(subscribeGunMapData([postHash[1]], isValidData, abortSignal)),
                main(subscribeGunMapData([postHash[0]], isValidData, abortSignal)),
            ]).then(() => queue.stop())

            async function main(keyProvider: AsyncGenerator<unknown>) {
                for await (const data of keyProvider) emit(data)
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

    export type PublishedAESKeyRecord = {
        aesKey: { encryptedKey: string; salt: string }
        receiverKey: EC_Public_JsonWebKey
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
        network: SocialNetworkEnum,
        receiversKeys: PublishedAESKeyRecord[] | EncryptionResultE2EMap,
    ) {
        const [postHash] = await hashIV(network, postIV)
        if (Array.isArray(receiversKeys)) {
            // Store AES key to gun
            receiversKeys.forEach(async ({ aesKey, receiverKey }) => {
                const keyHash = await (version === -38 ? hashKey38 : hashKey39)(receiverKey)
                console.log(`gun[${postHash}][${keyHash}].push(`, aesKey, ')')
                pushToGunDataArray([postHash, keyHash], aesKey)
            })
        } else {
            if (version === -39) throw new Error('unreachable')
            for (const result of receiversKeys.values()) {
                try {
                    if (result.status === 'rejected') continue
                    const { encryptedPostKey, target, ivToBePublished } = result.value
                    if (!ivToBePublished) throw new Error('Missing salt')
                    const pub = await queryPublicKey(target)
                    if (!pub) throw new Error('missing key')
                    const jwk = await CryptoKeyToJsonWebKey(pub)
                    const keyHash = await hashKey38(jwk)
                    const post: PublishedAESKeyRecord['aesKey'] = {
                        encryptedKey: encodeArrayBuffer(encryptedPostKey),
                        salt: encodeArrayBuffer(ivToBePublished),
                    }
                    console.log(`gun[${postHash}][${keyHash}].push(`, post, ')')
                    pushToGunDataArray([postHash, keyHash], post)
                } catch (error) {
                    console.error('[@masknet/encryption] An error occurs when sending E2E keys', error)
                }
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
        network: SocialNetworkEnum,
        iv: Uint8Array,
        key: EC_Public_JsonWebKey,
    ) {
        const postHash = await hashIV(network, iv)
        // In version > -39, we will use stable hash to prevent unstable result for key hashing

        const keyHash = version === -39 ? await hashKey39(key) : await hashKey38(key)
        return { postHash, keyHash }
    }

    async function hashIV(network: SocialNetworkEnum, iv: Uint8Array): Promise<[string, string]> {
        const hashPair = '9283464d-ee4e-4e8d-a7f3-cf392a88133f'
        const N = 2

        const hash = (await work(encodeArrayBuffer(iv), hashPair)).slice(0, N)
        const networkHint = getNetworkHint(network)
        return [`${networkHint}${hash}`, `${networkHint}-${hash}`]
    }

    function getNetworkHint(x: SocialNetworkEnum) {
        if (x === SocialNetworkEnum.Facebook) return ''
        if (x === SocialNetworkEnum.Twitter) return 'twitter-'
        if (x === SocialNetworkEnum.Minds) return 'minds-'
        if (x === SocialNetworkEnum.Instagram) return 'instagram-'
        if (x === SocialNetworkEnum.Unknown)
            throw new TypeError('[@masknet/encryption] Current SNS network is not correctly configured.')
        unreachable(x)
    }

    // The difference between V38 and V39 is: V39 is not stable (JSON.stringify)
    // it's an implementation bug but for backward compatibility, it cannot be changed.
    // Therefore we upgraded the version and use a stable hash.
    async function hashKey39(key: EC_Public_JsonWebKey) {
        const hashPair = '10198a2f-205f-45a6-9987-3488c80113d0'
        const N = 2

        const jwk = JSON.stringify(key)
        const hash = await work(jwk, hashPair)
        return hash.slice(0, N)
    }

    async function hashKey38(jwk: EC_Public_JsonWebKey) {
        const hashPair = '10198a2f-205f-45a6-9987-3488c80113d0'
        const N = 2

        const hash = await work(jwk.x! + jwk.y!, hashPair)
        return hash.slice(0, N)
    }

    // This is a self contained Gun.SEA.work implementation that only contains code path we used.
    async function work(data: Uint8Array | string, salt: Uint8Array | string) {
        if (typeof data === 'string') data = new TextEncoder().encode(data)
        if (typeof salt === 'string') salt = new TextEncoder().encode(salt)
        const key = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits'])
        const params: Pbkdf2Params = { name: 'PBKDF2', iterations: 100000, salt, hash: { name: 'SHA-256' } }
        const derived = await crypto.subtle.deriveBits(params, key, 512)
        return window.btoa(String.fromCharCode(...new Uint8Array(derived)))
    }
}

export const { GUN_queryPostKey_version39Or38, publishPostAESKey_version39Or38 } = Version38Or39
export type PublishedAESKeyRecord_version39Or38 = Version38Or39.PublishedAESKeyRecord
