import { ValueRef } from '@dimensiondev/holoflows-kit'
import { editMetadata } from './metadata'

/** @deprecated */
export const globalTypedMessageMetadata = new ValueRef<ReadonlyMap<string, any>>(new Map<string, any>())
/** @deprecated */
export function editActivatedPostMetadata(f: Parameters<typeof editMetadata>[1]) {
    globalTypedMessageMetadata.value = editMetadata(globalTypedMessageMetadata.value, f)
    return globalTypedMessageMetadata.value
}
