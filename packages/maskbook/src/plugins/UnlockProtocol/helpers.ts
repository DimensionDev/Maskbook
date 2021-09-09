import { createRenderWithMetadata, createTypedMessageMetadataReader } from '../../protocols/typed-message'
import { pluginMetaKey } from './constants'
import type { UnlockProtocolMetadata } from './types'
import schema from './schema.json'

export const UnlockProtocolMetadataReader = createTypedMessageMetadataReader<UnlockProtocolMetadata>(
    pluginMetaKey,
    schema,
)
export const renderWithUnlockProtocolMetadata = createRenderWithMetadata(UnlockProtocolMetadataReader)
