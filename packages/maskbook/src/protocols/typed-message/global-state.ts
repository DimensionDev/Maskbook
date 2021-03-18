import { ValueRef } from '@dimensiondev/holoflows-kit'
import { editMetadata } from './metadata'

export const globalTypedMessageMetadata = new ValueRef<ReadonlyMap<string, any>>(new Map<string, any>())
export function editActivatedPostMetadata(f: Parameters<typeof editMetadata>[1]) {
    globalTypedMessageMetadata.value = editMetadata(globalTypedMessageMetadata.value, f)
    return globalTypedMessageMetadata.value
}
