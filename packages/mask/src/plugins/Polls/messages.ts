import { PLUGIN_ID } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'
import { AsyncCall, _AsyncVersionOf } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'

const PollMessage = createPluginMessage(PLUGIN_ID)
export const PluginPollRPC: _AsyncVersionOf<typeof import('./Services')> = createPluginRPC(
    PLUGIN_ID,
    () => {
        const PollWorker = new OnDemandWorker(new URL('./Services.ts', import.meta.url), { name: 'Plugin/Poll' })
        return AsyncCall({}, { channel: new WorkerChannel(PollWorker), thenable: false })
    },
    PollMessage.rpc,
    true,
)
