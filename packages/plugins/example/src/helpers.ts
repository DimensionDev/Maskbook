import { createTypedMessageMetadataReader, createRenderWithMetadata } from '@masknet/shared-base'
import type { PollMetaData } from './types'
import { META_KEY_2 } from './constants'
import schema from './schema.json'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>(META_KEY_2, schema)
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)
if (import.meta.webpackHot) import.meta.webpackHot.accept()
