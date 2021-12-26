import { createTypedMessageMetadataReader, createRenderWithMetadata } from '@masknet/shared-base'
import type { PollMetaData } from './types'
import { POLL_META_KEY_1 } from './constants'
import schema from './schema.json'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>(POLL_META_KEY_1, schema)
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)
if (import.meta.webpackHot) import.meta.webpackHot.accept()
