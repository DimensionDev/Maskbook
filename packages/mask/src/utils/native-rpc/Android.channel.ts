import type { EventBasedChannel } from 'async-call-rpc/full'

export class AndroidGeckoViewChannel implements EventBasedChannel {
    port = browser.runtime.connectNative('browser')
    on(cb: (data: unknown) => void) {
        this.port.onMessage.addListener(cb)
        return () => this.port.onMessage.removeListener(cb)
    }
    send(data: unknown): void {
        this.port.postMessage(data)
    }
}
