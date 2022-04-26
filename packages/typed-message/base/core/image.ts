import type { NonSerializableTypedMessage, Meta } from '../base.js'
import { createIsType } from '../utils/internal.js'

/**
 * A single image
 * TODO: it should be serializable but still not decided how to do that yet.
 */
export interface TypedMessageImage extends NonSerializableTypedMessage {
    readonly type: 'image'
    readonly image: string | Blob
    readonly width?: number
    readonly height?: number
}

export const isTypedMessageImage = createIsType<TypedMessageImage>('image')

export function makeTypedMessageImage(
    image: TypedMessageImage['image'],
    size?: { width: number; height: number },
    meta?: Meta,
): TypedMessageImage {
    return {
        type: 'image',
        serializable: false,
        image,
        width: size?.width,
        height: size?.height,
        meta,
    }
}
