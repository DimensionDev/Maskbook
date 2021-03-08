import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { RedPacketMetaKey } from './constants'
import type { RedPacketJSONPayload, RedPacketRecord } from './types'
import schema from './schema'

export const RedPacketMetadataReader = createTypedMessageMetadataReader<RedPacketJSONPayload>(RedPacketMetaKey, schema)
export const renderWithRedPacketMetadata = createRenderWithMetadata(RedPacketMetadataReader)

export function RedPacketComparer(a: RedPacketRecord | null, b: RedPacketRecord | null) {
    if (!a || !b) return false
    return a.id === b.id && a.from === b.from
}

export function RedPacketArrayComparer(a: RedPacketRecord[], b: RedPacketRecord[]) {
    if (a.length !== b.length) return false
    return a.every((wallet, index) => RedPacketComparer(wallet, b[index]))
}
