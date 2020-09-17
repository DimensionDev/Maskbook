import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import type { PollMetaData } from './types'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>('com.maskbook.poll:1', {})
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)
