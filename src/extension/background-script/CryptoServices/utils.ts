import { Payload, PayloadAlpha38 } from '../../../utils/type-transform/Payload'
import stringify from 'json-stable-stringify'

export function getSignablePayload(payload: Payload) {
    if (payload.version >= -37) {
        return stringify({
            encryptedText: payload.encryptedText,
            iv: payload.iv,
            ownersKey: (payload as PayloadAlpha38).AESKeyEncrypted,
        })
    }
    // ! Don't use payload.ts, this is an internal representation used for signature.
    else
        return `4/4|${payload.version === -38 ? payload.AESKeyEncrypted : payload.ownersAESKeyEncrypted}|${
            payload.iv
        }|${payload.encryptedText}`
}

import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Alpha38 from '../../../crypto/crypto-alpha-38'

export const cryptoProviderTable = {
    [-40]: Alpha40,
    [-39]: Alpha39,
    [-38]: Alpha38,
} as const

export interface TypedMessageMetadata {
    readonly meta?: ReadonlyMap<string, any>
    readonly version: 1
}
export interface TypedMessageText extends TypedMessageMetadata {
    readonly type: 'text'
    readonly content: string
}
export interface TypedMessageComplex extends TypedMessageMetadata {
    readonly type: 'complex'
    readonly items: readonly TypedMessage[]
}
export interface TypedMessageUnknown extends TypedMessageMetadata {
    readonly type: 'unknown'
}
export type TypedMessage = TypedMessageText | TypedMessageComplex | TypedMessageUnknown
export function makeTypedMessage(text: string, meta?: ReadonlyMap<string, any>): TypedMessageText
export function makeTypedMessage(content: string, meta?: ReadonlyMap<string, any>): TypedMessage {
    if (typeof content === 'string') {
        const text: TypedMessageText = { type: 'text', content, version: 1, meta }
        return text
    }
    const msg: TypedMessageUnknown = { type: 'unknown', version: 1, meta }
    return msg
}
