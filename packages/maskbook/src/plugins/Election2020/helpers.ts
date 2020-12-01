import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { Election2020MetaKey } from './constants'
import type { Election2020JSONPayload } from './types'
import schema from './schema.json'

export const Election2020MetadataReader = createTypedMessageMetadataReader<Election2020JSONPayload>(
    Election2020MetaKey,
    schema,
)
export const renderWithElection2020Metadata = createRenderWithMetadata(Election2020MetadataReader)
