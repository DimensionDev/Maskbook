import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { PLUGIN_META_KEY } from './constants'
import type { CollectibleJSON_Payload } from './types'
import schema from './schema.json'

export const CollectibleMetadataReader = createTypedMessageMetadataReader<CollectibleJSON_Payload>(
    PLUGIN_META_KEY,
    schema,
)
export const renderWithCollectibleMetadata = createRenderWithMetadata(CollectibleMetadataReader)
