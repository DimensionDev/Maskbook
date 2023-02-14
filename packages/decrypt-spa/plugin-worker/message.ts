export type PortAwareHandler = (message: unknown, port: MessagePort | null) => void

export function addListener(type: string, handler: PortAwareHandler) {
    if (!messageHandlers.has(type)) messageHandlers.set(type, new Set())
    const store = messageHandlers.get(type)!
    store.add(handler)
    return () => store.delete(handler)
}

export function broadcastMessage(type: string, message: unknown) {
    if (livingPorts.size) {
        livingPorts.forEach((port) => port.postMessage([type, message]))
    } else {
        postMessage([type, message])
    }
}

const livingPorts = new Set<MessagePort>()
const messageHandlers = new Map<string, Set<(message: any, fromPort: MessagePort | null) => void>>()

// shared worker
globalThis.addEventListener('connect', (event) => {
    const port: MessagePort = event.ports[0]
    // message send through port is a tuple [type, data]
    port.addEventListener('message', (e) => {
        const [type, data] = e.data
        const handler = messageHandlers.get(type)
        if (!handler?.size) return
        for (const h of handler) h(data, port)
    })
    port.start()
})

// normal worker
globalThis.addEventListener('message', (event) => {
    const [type, data] = event.data
    const handler = messageHandlers.get(type)
    if (!handler?.size) return
    for (const h of handler) h(data, null)
})
