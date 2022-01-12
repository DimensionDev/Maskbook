import type { SerializableTypedMessage } from '../base'
import { createIsType } from '../utils/internal'

export interface TypedMessageEmpty extends SerializableTypedMessage<1> {
    readonly type: 'empty'
    readonly meta?: undefined
}

export const isTypedMessageEmpty = createIsType<TypedMessageEmpty>('empty')

export function makeTypedMessageEmpty(): TypedMessageEmpty {
    return {
        type: 'empty',
        serializable: true,
        version: 1,
        meta: undefined,
    }
}
