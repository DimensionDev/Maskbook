import type { SerializableTypedMessage, TypedMessage, Meta } from '../base.js'
import { createIsType } from '../utils/internal.js'

export type TypedMessageText = TypedMessageTextV1

/** A text message */
export interface TypedMessageTextV1 extends SerializableTypedMessage<1> {
    readonly type: 'text'
    readonly content: string
}

export const isTypedMessageTextV1 = createIsType<TypedMessageTextV1>('text', 1)

export const isTypedMessageText: (x: TypedMessage) => x is TypedMessageText = isTypedMessageTextV1

export function makeTypedMessageText(text: string, meta?: Meta): TypedMessageTextV1 {
    return {
        type: 'text',
        version: 1,
        serializable: true,
        content: text,
        meta,
    }
}
