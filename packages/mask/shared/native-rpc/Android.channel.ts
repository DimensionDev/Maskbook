import type { EventBasedChannel } from 'async-call-rpc/full'

export class AndroidGeckoViewChannel implements EventBasedChannel {
    port = browser.runtime.connectNative('browser')
    on(cb: (data: unknown) => void) {
        const realCallback = (data: object) => {
            const values = Object.values(data)
            if (values.length === 1) {
                cb(JSON.parse(values[0]))
            }
        }
        this.port.onMessage.addListener(realCallback)
        return () => this.port.onMessage.removeListener(realCallback)
    }
    send(data: unknown): void {
        this.port.postMessage(JSON.stringify(data))
    }
}