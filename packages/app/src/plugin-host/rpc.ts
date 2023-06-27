import { AsyncCall } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'
import { addListener, postMessage } from './message.js'

export const PluginWorker = AsyncCall<typeof import('../plugin-worker/service.js')>(
    {
        on(listener) {
            return addListener('rpc', (message) => listener(message))
        },
        send(data) {
            postMessage('rpc', data)
        },
    },
    { channel, log: true, serializer },
)
