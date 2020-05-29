import type { Payload, PayloadAlpha38 } from '../../../utils/type-transform/Payload'
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

import type { RedPacketJSONPayload } from '../../../plugins/Wallet/database/types'
import { Result, Err, Ok } from 'ts-results'
import { RedPacketMetaKey } from '../../../plugins/Wallet/RedPacketMetaKey'

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

interface KnownMetadata {
    [RedPacketMetaKey]: RedPacketJSONPayload
}
const builtinMetadataSchema: Partial<Record<string, object>> = {} as Partial<Record<keyof KnownMetadata, object>>
export function readTypedMessageMetadata<T extends keyof KnownMetadata>(
    meta: ReadonlyMap<string, any> | undefined,
    key: T,
    jsonSchema?: object,
): Result<KnownMetadata[T], void> {
    return readTypedMessageMetadataUntyped(meta, key, jsonSchema)
}
export function readTypedMessageMetadataUntyped<T>(
    meta: ReadonlyMap<string, any> | undefined,
    key: string,
    jsonSchema?: object,
): Result<T, void> {
    if (!meta) return Err.EMPTY
    if (!meta.has(key)) return Err.EMPTY
    if (!jsonSchema) {
        console.warn('You should add a JSON Schema to verify the metadata')
    } else {
        if (key in builtinMetadataSchema && builtinMetadataSchema[key] && !jsonSchema)
            jsonSchema = builtinMetadataSchema[key]
        // TODO: validate the schema.
    }
    return new Ok(meta.get(key))
}

export function withMetadata<T extends keyof KnownMetadata>(
    meta: ReadonlyMap<string, any> | undefined,
    key: T,
    render: (data: KnownMetadata[T]) => React.ReactNode,
    jsonSchema?: object,
): React.ReactNode | null {
    return withMetadataUntyped(meta, key, render as any, jsonSchema)
}
export function withMetadataUntyped(
    meta: ReadonlyMap<string, any> | undefined,
    key: string,
    render: (data: unknown) => React.ReactNode,
    jsonSchema?: object,
): React.ReactNode | null {
    const message = readTypedMessageMetadataUntyped(meta, key, jsonSchema)
    if (message.ok) return render(message.val)
    return null
}

export function extractTextFromTypedMessage(x: TypedMessage | null): Result<string, void> {
    if (x === null) return Err.EMPTY
    if (x.type === 'text') return new Ok(x.content)
    if (x.type === 'complex')
        return new Ok(x.items.map(extractTextFromTypedMessage).filter((x) => x.ok && x.val.length > 0)[0].val as string)
    return Err.EMPTY
}

export function textIntoTypedMessage(x: TypedMessage | string): TypedMessage {
    if (typeof x !== 'string') return x
    return {
        content: x,
        type: 'text',
        version: 1,
    }
}
