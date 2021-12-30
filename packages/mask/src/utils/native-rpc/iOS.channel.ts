import type { EventBasedChannel } from 'async-call-rpc/full'

const key = 'maskbookjsonrpc'
export class iOSWebkitChannel implements EventBasedChannel {
    constructor() {
        document.addEventListener(key, (e) => {
            const detail = (e as CustomEvent<unknown>).detail
            for (const f of this.listener) {
                try {
                    f(detail)
                } catch {}
            }
        })
    }
    private listener = new Set<(data: unknown) => void>()
    on(cb: (data: unknown) => void) {
        this.listener.add(cb)
        return () => void this.listener.delete(cb)
    }
    send(data: unknown): void {
        ;(globalThis as any).webkit.messageHandlers[key].postMessage(data)
    }
}
