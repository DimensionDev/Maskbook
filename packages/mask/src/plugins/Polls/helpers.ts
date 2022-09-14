import { createTypedMessageMetadataReader, createRenderWithMetadata } from '@masknet/typed-message/dom'
import type { PollMetaData } from './types.js'
import { PLUGIN_META_KEY } from './constants.js'
import schema from './schema.json'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>(PLUGIN_META_KEY, schema)
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)
if (import.meta.webpackHot) import.meta.webpackHot.accept()
