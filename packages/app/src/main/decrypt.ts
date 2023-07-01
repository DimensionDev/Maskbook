import type { AESCryptoKey } from '@masknet/base'
import {
    decrypt as lib_decrypt,
    type DecryptError,
    DecryptProgressKind,
    parsePayload,
    TwitterDecoder,
    type PayloadParseResult,
} from '@masknet/encryption'
import type { TypedMessage } from '@masknet/typed-message'
import { decodeArrayBuffer } from '@masknet/kit'

const cache = new Map<string, AESCryptoKey>()
export async function parsePayloadText(encoded: string): Promise<PayloadParseResult.Payload | null> {
    let payload = TwitterDecoder(
        'https://mask.io/?PostData_v1=' +
            encodeURI(encoded).replaceAll(/@$/g, '%40').replaceAll('%2F', '/').replaceAll('%3D', '='),
    ).unwrapOr('')
    if (typeof payload === 'string') {
        payload = payload.replaceAll('%20', '+')
    }
    return (await parsePayload(payload)).unwrapOr(null)
}
export async function parsePayloadBinary(encoded: string) {
    return (await parsePayload(new Uint8Array(decodeArrayBuffer(decodeURIComponent(encoded))))).unwrapOr(null)
}
export async function decrypt(
    cacheKey: string,
    payload: PayloadParseResult.Payload,
): Promise<TypedMessage | DecryptError> {
    const decryptProgress = lib_decrypt(
        { message: payload },
        {
            async getPostKeyCache() {
                return cache.get(cacheKey) ?? null
            },
            async setPostKeyCache(key) {
                cache.set(cacheKey, key)
            },
            async hasLocalKeyOf() {
                return false
            },
            async decryptByLocalKey() {
                throw new Error('not implemented.')
            },
            async queryAuthorPublicKey() {
                return null
            },
            async queryPostKey_version40() {
                return null
            },
            async *queryPostKey_version39() {
                throw new Error('not implemented.')
            },
            async *queryPostKey_version38() {
                throw new Error('not implemented.')
            },
            async *queryPostKey_version37() {
                throw new Error('not implemented.')
            },
            async deriveAESKey() {
                throw new Error('not implemented.')
            },
        },
    )
    for await (const progress of decryptProgress) {
        if (progress.type === DecryptProgressKind.Success) return progress.content
        if (progress.type === DecryptProgressKind.Error) return progress
    }
    throw new TypeError('unreachable')
}
