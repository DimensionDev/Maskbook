import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import type { PollMetaData } from './types'
import { identifier, POLL_META_KEY_1 } from './constants'
import schema from './schema.json'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>(POLL_META_KEY_1, schema)
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)
const PollMessage = createPluginMessage<{ _: unknown }>(identifier)
export const PluginPollRPC = createPluginRPC(() => import('./Services'), PollMessage.events._)
