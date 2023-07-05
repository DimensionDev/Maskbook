export type MessageHandler = (message: any) => void
export let postMessage: (type: string, data: unknown) => void
const messageHandlers = new Map<string, Set<MessageHandler>>()

function MessageEventReceiver(event: MessageEvent): void {
    const [type, data] = event.data
    const handler = messageHandlers.get(type)
    if (!handler?.size) return
    for (const h of handler) h(data)
}
if (typeof SharedWorker === 'function') {
    const worker = new SharedWorker(new URL('../plugin-worker/index.ts', import.meta.url), {
        name: 'mask plugin worker',
    })
    worker.port.addEventListener('message', MessageEventReceiver)
    worker.port.start()
    postMessage = (type: string, data: unknown) => worker.port.postMessage([type, data])
} else {
    const worker = new Worker(new URL('../plugin-worker/index.ts', import.meta.url), {
        name: 'mask plugin worker',
    })
    worker.addEventListener('message', MessageEventReceiver)
    postMessage = (type: string, data: unknown) => worker.postMessage([type, data])
}

export function addListener(type: string, callback: MessageHandler) {
    if (!messageHandlers.has(type)) messageHandlers.set(type, new Set())
    const store = messageHandlers.get(type)!
    store.add(callback)
    return () => store.delete(callback)
}
