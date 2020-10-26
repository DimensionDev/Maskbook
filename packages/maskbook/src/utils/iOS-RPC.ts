import { AsyncCall, EventBasedChannel } from 'async-call-rpc/full'

/**
 * This describes what JSONRPC calls that Native side should implement
 */
interface iOSHost {
    scanQRCode(): Promise<string>
    log(...args: any[]): Promise<void>
}
/**
 * This describes what JSONRPC calls that JS side should implement
 */
export interface ThisSideImplementation {}

const key = 'maskbookjsonrpc'
const _window: any = globalThis
export const hasWKWebkitRPCHandlers = _window?.webkit?.messageHandlers?.[key]
class iOSWebkitChannel implements EventBasedChannel {
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
        if (hasWKWebkitRPCHandlers) _window.webkit.messageHandlers[key].postMessage(data)
        else {
            throw new TypeError('Run in the wrong environment. Excepts window.webkit.messageHandlers')
        }
    }
}
const ThisSideImplementation: ThisSideImplementation = {}
export const iOSHost = AsyncCall<iOSHost>(ThisSideImplementation, {
    key: '',
    log: false,
    channel: new iOSWebkitChannel(),
    strict: false,
})
