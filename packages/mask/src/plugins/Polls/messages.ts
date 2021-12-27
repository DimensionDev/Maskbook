import { identifier } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { OnDemandWorker } from '../../../utils-pure'
import { AsyncCall, _AsyncVersionOf } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'

const PollMessage = createPluginMessage(identifier)
export const PluginPollRPC: _AsyncVersionOf<typeof import('./Services')> = createPluginRPC(
    identifier,
    () => {
        const PollWorker = new OnDemandWorker(new URL('./Services.ts', import.meta.url), { name: 'Plugin/Poll' })
        return AsyncCall({}, { channel: new WorkerChannel(PollWorker), thenable: false })
    },
    PollMessage.rpc,
    true,
)
