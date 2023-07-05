import * as Service from './service.js'
import { AsyncCall, type CallbackBasedChannel } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'
import { pluginWorkerReadyPromise } from './ready.js'

let mode: 'Worker' | 'SharedWorker'
/** Only used in SharedWorker mode */
const ports = new Set<MessagePort>()
const messageHandlers = new Map<string, Set<TargetAwareHandler>>()

const channel: CallbackBasedChannel = {
    setup(jsonRPCHandlerCallback) {
        addListener('rpc', (message, _, response) => {
            jsonRPCHandlerCallback(message).then((data) => response('rpc', data))
        })
    },
}
AsyncCall(Service, { channel, log: true, serializer })

export type TargetAwareHandler = (
    message: unknown,
    sender: MessagePort | null,
    response: (type: string, value: unknown) => void,
) => void
export function addListener(type: string, handler: TargetAwareHandler) {
    if (!messageHandlers.has(type)) messageHandlers.set(type, new Set())
    const store = messageHandlers.get(type)!
    store.add(handler)
    return () => store.delete(handler)
}

addListener('request-ready', (_, __, response) => {
    pluginWorkerReadyPromise.then(() => response('ready', undefined))
})

export function broadcastMessage(type: string, message: unknown) {
    if (ports.size) {
        ports.forEach((port) => port.postMessage([type, message]))
    } else {
        postMessage([type, message])
    }
}

// shared worker
globalThis.addEventListener('connect', (event) => {
    mode = 'SharedWorker'

    const port: MessagePort = (event as MessageEvent).ports[0]
    ports.add(port)
    // message send through port is a tuple [type, data]
    port.addEventListener('message', (e) => {
        const [type, data] = e.data
        const handlers = messageHandlers.get(type)
        if (!handlers?.size) return
        for (const f of handlers) {
            f(data, port, (type, value) => port.postMessage([type, value]))
        }
    })
    port.start()
})

// normal worker
globalThis.addEventListener('message', (event) => {
    mode = 'Worker'

    const [type, data] = event.data
    const handlers = messageHandlers.get(type)
    if (!handlers?.size) return
    for (const f of handlers) {
        f(data, null, (type, value) => globalThis.postMessage([type, value]))
    }
})
