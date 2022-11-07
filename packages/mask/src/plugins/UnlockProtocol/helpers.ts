import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/typed-message/dom'
import { PLUGIN_META_KEY } from './constants.js'
import type { UnlockProtocolMetadata } from './types.js'
import schema from './schema.json'

export const UnlockProtocolMetadataReader = createTypedMessageMetadataReader<UnlockProtocolMetadata>(
    PLUGIN_META_KEY,
    schema,
)
export const renderWithUnlockProtocolMetadata = createRenderWithMetadata(UnlockProtocolMetadataReader)
