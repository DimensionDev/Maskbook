import { createRenderWithMetadata, createTypedMessageMetadataReader } from '@masknet/typed-message/dom'
import { pluginMetaKey } from './constants.js'
import type { UnlockProtocolMetadata } from './types.js'
import schema from './schema.json'

export const UnlockProtocolMetadataReader = createTypedMessageMetadataReader<UnlockProtocolMetadata>(
    pluginMetaKey,
    schema,
)
export const renderWithUnlockProtocolMetadata = createRenderWithMetadata(UnlockProtocolMetadataReader)
