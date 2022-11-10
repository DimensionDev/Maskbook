import type { NonSerializableTypedMessage } from '../base.js'
import { createIsType } from '../utils/internal.js'

export interface TypedMessageUnknown extends NonSerializableTypedMessage {
    readonly type: 'unknown'
    /** The unrecognized data */
    readonly raw?: unknown
    readonly meta?: undefined
}
export const isTypedMessageUnknown = createIsType<TypedMessageUnknown>('unknown')

export function makeTypedMessageUnknown(raw?: unknown): TypedMessageUnknown {
    return { type: 'unknown', serializable: false, meta: undefined, raw }
}
