export interface TypedMessageMetadata {
    /**
     * The metadata this message contains
     */
    readonly meta?: ReadonlyMap<string, unknown>
    readonly version: 1
}
/** It represents a text message */
export interface TypedMessageText extends TypedMessageMetadata {
    readonly type: 'text'
    readonly content: string
}
/** It represents a single image */
export interface TypedMessageImage extends TypedMessageMetadata {
    readonly type: 'image'
    readonly content: string
}
/** It represents multiple TypedMessages (ordered) */
export interface TypedMessageCompound<T extends readonly TypedMessage[] = readonly TypedMessage[]>
    extends TypedMessageMetadata {
    readonly type: 'compound'
    readonly items: T
}
/** It represents an unknown TypedMessages */
export interface TypedMessageUnknown extends TypedMessageMetadata {
    readonly type: 'unknown'
    /** The unrecognized data */
    readonly raw?: unknown
}
export type TypedMessage = TypedMessageText | TypedMessageImage | TypedMessageCompound | TypedMessageUnknown

export function isTypedMessageText(x: TypedMessage): x is TypedMessageText {
    return x.type === 'text'
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
