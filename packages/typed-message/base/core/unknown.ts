import type { NonSerializableTypedMessage, Meta } from '../base'
import { createIsType } from '../utils/internal'

export interface TypedMessageUnknown extends NonSerializableTypedMessage {
    readonly type: 'unknown'
    /** The unrecognized data */
    readonly raw?: unknown
}
export const isTypedMessageUnknown = createIsType<TypedMessageUnknown>('unknown')

export function makeTypedMessageUnknown(raw?: unknown, meta?: Meta): TypedMessageUnknown {
    return { type: 'unknown', serializable: false, meta, raw }
}
