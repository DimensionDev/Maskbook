import { identifier } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { OnDemandWorker } from '../../web-workers/OnDemandWorker'
import { AsyncCall } from 'async-call-rpc'
import { WorkerChannel } from 'async-call-rpc/utils/web/worker'

const UnlockProtocolMessage = createPluginMessage(identifier)
export const PuginUnlockProtocolRPC = createPluginRPC(
    identifier,
    () => {
        const UnlockProtocolWorker = new OnDemandWorker(new URL('./Services.ts', import.meta.url), {
            name: 'Plugin/unlockprotocol',
        })
        return AsyncCall<typeof import('./Services')>(
            {},
            { channel: new WorkerChannel(UnlockProtocolWorker), thenable: false },
        )
    },
    UnlockProtocolMessage.rpc,
    true,
)
