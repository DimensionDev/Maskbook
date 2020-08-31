export interface TypedMessage {
    /**
     * The metadata this message contains
     */
    readonly meta?: ReadonlyMap<string, unknown>
    readonly type: string
    readonly version: 1
}
/** It represents a text message */
export interface TypedMessageText extends TypedMessage {
    readonly type: 'text'
    readonly content: string
}
/** It represents a signle link */
export interface TypedMessageAnchor extends TypedMessage {
    readonly type: 'anchor'
    readonly category: 'normal' | 'user' | 'cash' | 'hash'
    readonly href: string
    readonly content: string
}
/** It represents a single image */
export interface TypedMessageImage extends TypedMessage {
    readonly type: 'image'
    readonly image: string | Blob
    readonly width?: number
    readonly height?: number
}
/** It represents multiple TypedMessages (ordered) */
export interface TypedMessageCompound<T extends readonly TypedMessage[] = readonly TypedMessage[]>
    extends TypedMessage {
    readonly type: 'compound'
    readonly items: T
}
/** It represents an unknown TypedMessages */
export interface TypedMessageUnknown extends TypedMessage {
    readonly type: 'unknown'
    /** The unrecognized data */
    readonly raw?: unknown
}
export interface TypedMessageEmpty extends TypedMessage {
    readonly type: 'empty'
}
export interface TypedMessageSuspended<T extends TypedMessage = TypedMessage> extends TypedMessage {
    readonly type: 'suspended'
    readonly promise: Promise<T>
    readonly value: T | null
    readonly tag?: string
}

export function isTypedMessageText(x: TypedMessage): x is TypedMessageText {
    return x.type === 'text'
}
export function isTypedMessgaeAnchor(x: TypedMessage): x is TypedMessageAnchor {
    return x.type === 'anchor'
}
export function isTypedMessageKnown(x: TypedMessage) {
    return ['text', 'anchor', 'compound', 'image', 'empty', 'suspended'].includes(x.type)
}
export function isTypedMessageUnknown(x: TypedMessage): x is TypedMessageUnknown {
    return x.type === 'unknown'
}
export function isTypedMessageCompound(x: TypedMessage): x is TypedMessageCompound {
    return x.type === 'compound'
}
export function isTypedMessageImage(x: TypedMessage): x is TypedMessageImage {
    return x.type === 'image'
}
export function isTypedMessageEmpty(x: TypedMessage): x is TypedMessageEmpty {
    return x.type === 'empty'
}
export function isTypedMessageSuspended(x: TypedMessage): x is TypedMessageSuspended {
    return x.type === 'suspended'
}
