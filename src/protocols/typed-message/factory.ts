import type {
    TypedMessageText,
    TypedMessageAnchor,
    TypedMessageImage,
    TypedMessageUnknown,
    TypedMessageCompound,
    TypedMessage,
    TypedMessageEmpty,
    TypedMessageSuspended,
} from './'

type Meta = TypedMessage['meta']
/**
 * Create a TypedMessageText from a string
 * @param content Text
 * @param meta Metadata
 */
export function makeTypedMessageText(content: string, meta?: Meta): TypedMessageText {
    return { type: 'text', version: 1, content, meta }
}

/**
 * Create a TypedAnchorText from a html link
 * @param content Text
 * @param href the hypter link
 * @param meta
 */
export function makeTypedMessageAnchor(
    category: 'normal' | 'user' | 'cash' | 'hash',
    href: string,
    content: string,
    meta?: Meta,
): TypedMessageAnchor {
    return { type: 'anchor', version: 1, category, href, content, meta }
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
    return { type: 'compound', version: 1, items, meta }
}
export function makeTypedMessageFromList(): TypedMessageUnknown
export function makeTypedMessageFromList<T extends TypedMessage>(item: T): T
export function makeTypedMessageFromList<T extends readonly TypedMessage[]>(...items: T): TypedMessageCompound<T>
export function makeTypedMessageFromList(...items: TypedMessage[]): TypedMessage {
    if (items.length === 0) return makeTypedMessageUnknown()
    if (items.length === 1) return items[0]
    return makeTypedMessageCompound(items)
}
export function makeTypedMessageUnknown(raw?: unknown, meta?: Meta): TypedMessageUnknown {
    return { type: 'unknown', version: 1, raw, meta }
}
export function makeTypedMessageEmpty(meta?: Meta): TypedMessageEmpty {
    return { type: 'empty', version: 1, meta }
}
export function makeTypedMessageSuspended<T extends TypedMessage>(
    promise: Promise<T>,
    tag?: string,
    meta?: Meta,
): TypedMessageSuspended<T> {
    const x: TypedMessageSuspended<T> = { type: 'suspended', promise, tag, value: null, version: 1, meta }
    // internal mutability
    promise.then((i) => ((x as any).value = i))
    return x
}
/**
 * Create a TypedMessageImage from image
 * @param image The image, URL or a Blob
 * @param options width and height of the image
 * @param meta Metadata
 */
export function makeTypedMessageImage(
    image: Blob | string,
    { height, width }: { width?: number; height?: number } = {},
    meta?: ReadonlyMap<string, unknown>,
): TypedMessageImage {
    return { type: 'image', version: 1, image, width, height, meta }
}
