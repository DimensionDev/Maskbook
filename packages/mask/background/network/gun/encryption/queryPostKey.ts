import { decodeArrayBuffer, encodeArrayBuffer } from '@dimensiondev/kit'
import type { DecryptStaticECDH_PostKey } from '@masknet/encryption'
import type { EC_Public_CryptoKey, EC_Public_JsonWebKey, ProfileIdentifier } from '@masknet/shared-base'
import type { default as gun } from 'gun'
import { CryptoKeyToJsonWebKey } from '../../../../utils-pure'
import { getGunData, subscribeGunMapData } from '../utils'
import { EventIterator } from 'event-iterator'
import { noop } from 'lodash-unified'
type Gun = ReturnType<typeof gun>

// !!! Change how this file access Gun will break the compatibility of v40 payload decryption.
export async function GUN_queryPostKey_version40(
    gun: Gun,
    iv: Uint8Array,
    whoAmI: ProfileIdentifier,
): Promise<null | DecryptStaticECDH_PostKey> {
    // PATH ON GUN: maskbook > posts > iv > userID
    const result = await getGunData(gun, 'maskbook', 'posts', encodeArrayBuffer(iv), whoAmI.userId)
    if (!isValidData(result)) return null
    return {
        encryptedPostKey: new Uint8Array(decodeArrayBuffer(result.encryptedKey)),
        postKeyIV: new Uint8Array(decodeArrayBuffer(result.salt)),
    }

    type DataOnGun = { encryptedKey: string; salt: string }
    function isValidData(x: typeof result): x is DataOnGun {
        if (!x) return false

        const { encryptedKey, salt: encryptedKeyIV } = x
        if (typeof encryptedKey !== 'string' || typeof encryptedKeyIV !== 'string') return false
        return true
    }
}

namespace Version38Or39 {
    export async function* GUN_queryPostKey_version39Or38(
        gun: Gun,
        version: -38 | -39,
        iv: Uint8Array,
        minePublicKey: EC_Public_CryptoKey,
        networkHint: string,
        abortSignal: AbortSignal,
    ): AsyncGenerator<DecryptStaticECDH_PostKey, void, undefined> {
        const minePublicKeyJWK = await CryptoKeyToJsonWebKey(minePublicKey)
        const { keyHash, postHash } = await calculatePostKeyPartition(version, networkHint, iv, minePublicKeyJWK)

        /* cspell:disable-next-line */
        // ? In this step we get something like ["jzarhbyjtexiE7aB1DvQ", "jzarhuse6xlTAtblKRx9"]
        const internalNodeNames = Object.keys((await getGunData(gun, postHash, keyHash)) || {}).filter((x) => x !== '_')
        // ? In this step we get all keys in this category (gun2[postHash][keyHash])
        const resultPromise = internalNodeNames.map((key) => getGunData(gun, key))

        const iter = new EventIterator<DecryptStaticECDH_PostKey>((queue) => {
            for (const result of resultPromise) result.then(emit, noop)

            async function main() {
                const iter = subscribeGunMapData(gun, [postHash], isValidData, abortSignal)
                for await (const data of iter) emit(data)
            }

            main()

            function emit(result: any) {
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
        networkHint: string,
        iv: Uint8Array,
        key: EC_Public_JsonWebKey,
    ) {
        const postHash = await hashIV(networkHint, iv)
        // In version > -39, we will use stable hash to prevent unstable result for key hashing

        const keyHash = version === -39 ? await hashKey39(key) : await hashKey38(key)
        return { postHash, keyHash }
    }

    async function hashIV(networkHint: string, iv: Uint8Array) {
        const hashPair = `9283464d-ee4e-4e8d-a7f3-cf392a88133f`
        const N = 2

        const hash = await work(encodeArrayBuffer(iv), hashPair)
        return networkHint + hash.substring(0, N)
    }

    // The difference between V38 and V39 is: V39 is not stable (JSON.stringify)
    // it's an implementation bug but for backward compatibility, it cannot be changed.
    // Therefore we upgraded the version and use a stable hash.
    async function hashKey39(key: EC_Public_JsonWebKey) {
        const hashPair = `10198a2f-205f-45a6-9987-3488c80113d0`
        const N = 2

        const jwk = JSON.stringify(key)
        const hash = await work(jwk, hashPair)
        return hash.substring(0, N)
    }

    async function hashKey38(jwk: EC_Public_JsonWebKey) {
        const hashPair = `10198a2f-205f-45a6-9987-3488c80113d0`
        const N = 2

        const hash = await work(jwk.x! + jwk.y!, hashPair)
        return hash.substring(0, N)
    }

    // This is a self contained Gun.SEA.work implementation that only contains code path we used.
    async function work(data: string, salt: string) {
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(data), { name: 'PBKDF2' }, false, [
            'deriveBits',
        ])
        const work = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                iterations: 100000,
                salt: new TextEncoder().encode(salt),
                hash: { name: 'SHA-256' },
            },
            key,
            512,
        )
        const result = arrayBufferToBase64(work)
        return result

        function arrayBufferToBase64(buffer: ArrayBuffer) {
            let binary = ''
            const bytes = new Uint8Array(buffer)
            const len = bytes.byteLength
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i])
            }
            return window.btoa(binary)
        }
    }
}

export const { GUN_queryPostKey_version39Or38 } = Version38Or39
