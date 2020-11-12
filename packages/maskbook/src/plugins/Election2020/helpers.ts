import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import { Election2020MetaKey, Election2020PluginID } from './constants'
import type { Election2020JSONPayload } from './types'
import schema from './schema.json'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
export const Election2020MetadataReader = createTypedMessageMetadataReader<Election2020JSONPayload>(
    Election2020MetaKey,
    schema,
)
export const renderWithElection2020Metadata = createRenderWithMetadata(Election2020MetadataReader)
const ElectionMessage = createPluginMessage<{ _: unknown }>(Election2020PluginID)
export const PluginElection2020 = createPluginRPC(() => import('./services'), ElectionMessage.events._)
