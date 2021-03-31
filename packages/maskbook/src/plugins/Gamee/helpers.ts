import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { GameeMetaKey } from './constants'
import type { GameeJSONPayload } from './types'
import schema from './schema.json'

export const GammeMetadataReader = createTypedMessageMetadataReader<GameeJSONPayload>(GameeMetaKey, schema)
export const renderWithGammeMetadata = createRenderWithMetadata(GammeMetadataReader)
