import { AsyncCall, type EventBasedChannel } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'
import { addListener, postMessage } from './message.js'

const channel: EventBasedChannel = {
    on(listener) {
        return addListener('rpc', (message) => listener(message))
    },
    send(data) {
        postMessage('rpc', data)
    },
}

export const BackgroundWorker = AsyncCall<typeof import('../background-worker/service.js')>(
    {},
    { channel, log: true, serializer },
)
