import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { ITO_MetaKey } from './constants'
import type { ITO_JSONPayload } from './types'
import schema from './schema.json'

export const ITO_MetadataReader = createTypedMessageMetadataReader<ITO_JSONPayload>(ITO_MetaKey, schema)
export const renderWithITO_Metadata = createRenderWithMetadata(ITO_MetadataReader)
