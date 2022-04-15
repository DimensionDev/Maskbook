import type { SerializableTypedMessage } from '../base.js'
import { createIsType } from '../utils/internal.js'

export interface TypedMessageEmpty extends SerializableTypedMessage<1> {
    readonly type: 'empty'
    readonly meta?: undefined
}

export const isTypedMessageEmpty = createIsType<TypedMessageEmpty>('empty')

const empty: TypedMessageEmpty = {
    type: 'empty',
    serializable: true,
    version: 1,
    meta: undefined,
}
Object.setPrototypeOf(empty, null)
Object.freeze(empty)
export function makeTypedMessageEmpty(): TypedMessageEmpty {
    return empty
}
