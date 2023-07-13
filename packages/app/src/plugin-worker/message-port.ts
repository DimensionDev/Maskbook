import { pluginWorkerReadyPromise } from './ready.js'

const ports = new Set<MessagePort>()
export const messageHandlers = new Map<string, Set<TargetAwareHandler>>()
export type TargetAwareHandler = (
    message: unknown,
    sender: MessagePort | null,
    response: (type: string, value: unknown) => void,
) => void
export type InternalMessage_PluginMessage = [type: string, data: unknown, requirePageVisible?: boolean]
// shared worker
globalThis.addEventListener('connect', (event) => {
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
    pluginWorkerReadyPromise.then(() => port.postMessage(['ready', undefined]))
})

// normal worker
globalThis.addEventListener('message', (event) => {
    const [type, data] = event.data
    if (type === 'ready-request') {
        pluginWorkerReadyPromise.then(() => postMessage(['ready', undefined]))
        return
    }

    const handlers = messageHandlers.get(type)
    if (!handlers?.size) return
    for (const f of handlers) {
        f(data, null, (type, value) => globalThis.postMessage([type, value]))
    }
})

export function addListener(type: string, handler: TargetAwareHandler) {
    if (!messageHandlers.has(type)) messageHandlers.set(type, new Set())
    const store = messageHandlers.get(type)!
    store.add(handler)
    return () => store.delete(handler)
}

export function broadcastMessage(type: string, message: unknown) {
    if (ports.size) {
        ports.forEach((port) => port.postMessage([type, message]))
    } else {
        postMessage([type, message])
    }
}
