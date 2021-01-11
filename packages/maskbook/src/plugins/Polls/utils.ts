import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import type { PollMetaData } from './types'
import { identifier, POLL_META_KEY_1 } from './constants'
import schema from './schema.json'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'
import { AsyncCall } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'

export const PollMetadataReader = createTypedMessageMetadataReader<PollMetaData>(POLL_META_KEY_1, schema)
export const renderWithPollMetadata = createRenderWithMetadata(PollMetadataReader)
if (module.hot) module.hot.accept()
const PollMessage = createPluginMessage<{ _: unknown }>(identifier)
export const PluginPollRPC = createPluginRPC(
    identifier,
    () => {
        const PollWorker = new OnDemandWorker(new URL('./Services.ts', import.meta.url), { name: 'Plugin/Poll' })
        return AsyncCall<typeof import('./Services')>({}, { channel: new WorkerChannel(PollWorker), thenable: false })
    },
    PollMessage.events._,
)
