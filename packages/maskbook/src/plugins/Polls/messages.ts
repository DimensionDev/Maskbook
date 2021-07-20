import { identifier } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'
import { AsyncCall } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'

const PollMessage = createPluginMessage(identifier)
export const PluginPollRPC = createPluginRPC(
    identifier,
    () => {
        const PollWorker = new OnDemandWorker(new URL('./Services.ts', import.meta.url), { name: 'Plugin/Poll' })
        return AsyncCall<typeof import('./Services')>({}, { channel: new WorkerChannel(PollWorker), thenable: false })
    },
    PollMessage.rpc,
    true,
)
