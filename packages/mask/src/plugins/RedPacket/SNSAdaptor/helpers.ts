import { createRenderWithMetadata, createTypedMessageMetadataReader } from '../../../protocols/typed-message'
import { RedPacketMetaKey, RedPacketNftMetaKey } from '../constants'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '../types'
import schema from '../schema.json'
import schemaNtf from '../schema-nft.json'

export const RedPacketMetadataReader = createTypedMessageMetadataReader<RedPacketJSONPayload>(RedPacketMetaKey, schema)
export const renderWithRedPacketMetadata = createRenderWithMetadata(RedPacketMetadataReader)

export const RedPacketNftMetadataReader = createTypedMessageMetadataReader<RedPacketNftJSONPayload>(
    RedPacketNftMetaKey,
    schemaNtf,
)
export const renderWithRedPacketNftMetadata = createRenderWithMetadata(RedPacketNftMetadataReader)
