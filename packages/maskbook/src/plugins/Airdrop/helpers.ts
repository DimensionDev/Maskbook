import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { AirdropMetaKey } from './constants'
import type { AirdropJSONPayload } from './types'
import schema from './schema.json'

export const AirdropMetadataReader = createTypedMessageMetadataReader<AirdropJSONPayload>(AirdropMetaKey, schema)
export const renderWithAirdropMetadata = createRenderWithMetadata(AirdropMetadataReader)
