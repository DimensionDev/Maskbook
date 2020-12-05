import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { COTM_MetaKey } from './constants'
import type { COTM_JSONPayload } from './types'
import schema from './schema.json'

export const COTM_MetadataReader = createTypedMessageMetadataReader<COTM_JSONPayload>(COTM_MetaKey, schema)
export const renderWithCOTM_Metadata = createRenderWithMetadata(COTM_MetadataReader)
