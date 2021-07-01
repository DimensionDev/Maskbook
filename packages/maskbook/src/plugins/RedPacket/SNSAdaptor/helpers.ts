import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../../protocols/typed-message/metadata'
import { RedPacketMetaKey } from '../constants'
import type { RedPacketJSONPayload } from '../types'
import schema from '../schema.json'

export const RedPacketMetadataReader = createTypedMessageMetadataReader<RedPacketJSONPayload>(RedPacketMetaKey, schema)
export const renderWithRedPacketMetadata = createRenderWithMetadata(RedPacketMetadataReader)
