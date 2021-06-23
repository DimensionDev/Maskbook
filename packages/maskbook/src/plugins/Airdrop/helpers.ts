import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { PLUGIN_META_KEY } from './constants'
import type { AirdropJSONPayload } from './types'
import schema from './schema.json'

export const AirdropMetadataReader = createTypedMessageMetadataReader<AirdropJSONPayload>(PLUGIN_META_KEY, schema)
export const renderWithAirdropMetadata = createRenderWithMetadata(AirdropMetadataReader)
