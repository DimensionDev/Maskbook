import { AsyncCall, type EventBasedChannel } from 'async-call-rpc'
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
export const worker = AsyncCall<typeof import('../plugin-worker/service.js')>({}, { channel, log: true, serializer })
