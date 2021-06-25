import { identifier } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'
import { AsyncCall } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'

const PollMessage = createPluginMessage<{ _: unknown }>(identifier)
export const PluginPollRPC = createPluginRPC(
    identifier,
    () => {
        const PollWorker = new OnDemandWorker(new URL('./Services.ts', import.meta.url), { name: 'Plugin/Poll' })
        return AsyncCall<typeof import('./Services')>({}, { channel: new WorkerChannel(PollWorker), thenable: false })
    },
    PollMessage.events._,
    true,
)
