import { AsyncCall } from '@holoflows/kit/es'

/**
 * This describes what JSONRPC calls that Native side should implement
 */
export interface Host {
    'scanQRCode'(): Promise<string>
}
/**
 * This describes what JSONRPC calls that JS side should implement
 */
export interface ThisSideImplementation {}

const key = 'maskbookjsonrpc'
class iOSWebkitChannel {
    constructor() {
        document.addEventListener(key, e => {
            const detail = (e as CustomEvent<any>).detail
            for (const f of this.listener) {
                try {
                    f(detail)
                } catch {}
            }
        })
    }
    private listener: Array<(data: unknown) => void> = []
    on(_: string, cb: (data: any) => void): void {
        this.listener.push(cb)
    }
    emit(_: string, data: any): void {
        const _window: any = window
        if (_window.webkit && _window.webkit.messageHandlers && _window.webkit.messageHandlers[key])
            _window.webkit.messageHandlers[key].postMessage(data)
    }
}
const ThisSideImplementation: ThisSideImplementation = {}
export const Host = AsyncCall<Host>(ThisSideImplementation as any, {
    key: '',
    log: false,
    messageChannel: new iOSWebkitChannel(),
})
