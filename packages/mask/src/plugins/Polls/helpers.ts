import { createTypedMessageMetadataReader, createRenderWithMetadata } from '@masknet/shared-base'
import type { PollMetaData } from './types'
import { PLUGIN_META_KEY } from './constants'
import schema from './schema.json'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>(PLUGIN_META_KEY, schema)
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)
if (import.meta.webpackHot) import.meta.webpackHot.accept()
