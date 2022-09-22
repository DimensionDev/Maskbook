import { Environment, isEnvironment, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { decodeArrayBuffer, defer, encodeArrayBuffer, unreachable } from '@dimensiondev/kit'
import { createSerializer } from '@masknet/shared-base'

function sendStream(stream: ReadableStream) {
    if (isEnvironment(Environment.ManifestBackground)) {
        const id = Math.random().toString()
        function onConnect(port: browser.runtime.Port) {
            if (port.name !== `stream:${id}`) return
            browser.runtime.onConnect.removeListener(onConnect)

            const reader = stream.getReader()
            // TODO: change to satisfies in TS next version
            function onMessage(message: HostReceive) {
                if (message.type === 'pull') {
                    reader.read().then(
                        (status) => {
                            if (status.done) {
                                port.postMessage({ type: 'done' } as HostSend)
                                reader.releaseLock()
                                port.onMessage.removeListener(onMessage as any)
                            } else {
                                const data = status.value
                                if (ArrayBuffer.isView(data) || data instanceof ArrayBuffer) {
                                    port.postMessage({
                                        type: 'binary-chunk',
                                        data: encodeArrayBuffer(data as Uint8Array),
                                    } as HostSend)
                                } else {
                                    port.postMessage({ type: 'chunk', data: status.value } as HostSend)
                                }
                            }
                        },
                        (error) => port.postMessage({ type: 'error', reason: error } as HostSend),
                    )
                } else if (message.type === 'cancel') {
                    reader
                        .cancel(message.reason)
                        .then(
                            () => port.postMessage({ type: 'cancelled' } as HostSend),
                            (error) => port.postMessage({ type: 'cancel-error', reason: error } as HostSend),
                        )
                        .finally(() => reader.releaseLock())
                } else unreachable(message)
            }
            port.onMessage.addListener(onMessage as any)
        }
        browser.runtime.onConnect.addListener(onConnect)
        return id
    } else {
        async function _() {
            const reader = stream.getReader()
            const data: any[] = []
            let status = await reader.read()
            while (!status.done) {
                data.push(status.value)
                status = await reader.read()
            }
            return data
        }
        return _()
    }
}
function restoreSream(stream: string | any[]) {
    if (typeof stream === 'string') {
        const port = browser.runtime.connect({ name: `stream:${stream}` })
        let controller: ReadableStreamController<any>
        const [cancelPromise, resolveCancel, rejectCancel] = defer<void>()
        function onMessage(message: HostSend) {
            if (message.type === 'cancelled') resolveCancel()
            else if (message.type === 'done') {
                try {
                    controller.close()
                } catch {}
            } else if (message.type === 'cancel-error') rejectCancel(message.reason)
            else if (message.type === 'chunk') controller.enqueue(message.data)
            else if (message.type === 'binary-chunk')
                controller.enqueue(new Uint8Array(decodeArrayBuffer(message.data)))
            else if (message.type === 'error') controller.error(message.reason)
            else unreachable(message)
        }
        port.onMessage.addListener(onMessage as any)
        return new ReadableStream({
            start(c) {
                controller = c
            },
            pull() {
                port.postMessage({ type: 'pull' } as HostReceive)
            },
            cancel(reason) {
                port.postMessage({ type: 'cancel', reason } as HostReceive)
                return cancelPromise
            },
        })
    } else {
        return new ReadableStream({
            start(controller) {
                stream.forEach((data) => controller.enqueue(data))
                controller.close()
            },
        })
    }
}
function sendAbortSignal(signal: AbortSignal): string {
    const id = Math.random().toString()
    signal.addEventListener('abort', () => messages.events.as.sendToAll([id, signal.reason]), {
        once: true,
    })
    return id
}
function restoreAbortSignal(id: string): AbortSignal {
    const controller = new AbortController()
    messages.events.as.on(([abortID, reason]) => (abortID === id ? controller.abort(reason) : void 0), {
        signal: controller.signal,
    })
    return controller.signal
}

export const specializedSerializer = createSerializer({
    stream: [sendStream, restoreSream],
    abortSignal: [sendAbortSignal, restoreAbortSignal],
})
const messages = new WebExtensionMessage<{
    // abort signal
    as: [id: string, reason: unknown]
}>({ domain: 'ser' })
messages.serialization = specializedSerializer

type HostReceive = { type: 'pull' } | { type: 'cancel'; reason: any }
type HostSend =
    | { type: 'chunk'; data: any }
    | { type: 'binary-chunk'; data: string }
    | { type: 'done' }
    | { type: 'cancelled' }
    | { type: 'error'; reason: any }
    | { type: 'cancel-error'; reason: any }
