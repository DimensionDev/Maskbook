import type { NonSerializableTypedMessage } from '../base'
import { createIsType } from '../utils/internal'

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
