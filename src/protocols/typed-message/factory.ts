import type {
    TypedMessageText,
    TypedMessageImage,
    TypedMessageUnknown,
    TypedMessageMetadata,
    TypedMessageCompound,
    TypedMessage,
} from './types'
import { imgType } from '@dimensiondev/stego-js/cjs/helper'
import { encodeArrayBuffer } from '@dimensiondev/kit'

type Meta = TypedMessageMetadata['meta']
/**
 * Create a TypedMessageText from a string
 * @param content Text
 * @param meta Metadata
 */
export function makeTypedMessageText(content: string, meta?: Meta): TypedMessageText {
    return { type: 'text', content, version: 1, meta }
}
/**
 * Create a TypedMessageCompound from a list of TypedMessage
 * @param items A ordered list of TypedMessage
 * @param meta Metadata
 */
export function makeTypedMessageCompound<T extends readonly TypedMessage[]>(
    items: T,
    meta?: Meta,
): TypedMessageCompound<T> {
    return { type: 'compound', items, version: 1, meta }
}
export function makeTypedMessageUnknown(raw?: unknown, meta?: Meta): TypedMessageUnknown {
    return { type: 'unknown', version: 1, meta, raw }
}
/**
 * Create a TypedMessageImage from image
 * @param buffer The image
 * @param meta Metadata
 */
export function makeTypedMessageImage(buffer: ArrayBuffer, meta?: ReadonlyMap<string, unknown>) {
    if (imgType(new Uint8Array(buffer)).includes('image')) {
        const image: TypedMessageImage = {
            meta,
            type: 'image',
            content: encodeArrayBuffer(buffer),
            version: 1,
        }
        return image
    }
    return makeTypedMessageUnknown(buffer)
}
