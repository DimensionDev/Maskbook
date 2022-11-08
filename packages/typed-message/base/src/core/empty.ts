import type { SerializableTypedMessage } from '../base.js'
import { createIsType } from '../utils/internal.js'

export interface TypedMessageEmpty extends SerializableTypedMessage<1> {
    readonly type: 'empty'
    readonly meta?: undefined
}

export const isTypedMessageEmpty = createIsType<TypedMessageEmpty>('empty')

let empty: TypedMessageEmpty
export function makeTypedMessageEmpty(): TypedMessageEmpty {
    if (empty) return empty

    empty = {
        type: 'empty',
        serializable: true,
        version: 1,
        meta: undefined,
    }
    Object.setPrototypeOf(empty, null)
    Object.freeze(empty)
    return empty
}
