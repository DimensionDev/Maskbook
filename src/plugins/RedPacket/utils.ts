import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { RedPacketMetaKey } from './constants'
import type { RedPacketJSONPayload } from './types'

export const RedPacketMetadataReader = createTypedMessageMetadataReader<RedPacketJSONPayload>(RedPacketMetaKey)
export const renderWithRedPacketMetadata = createRenderWithMetadata(RedPacketMetadataReader)
