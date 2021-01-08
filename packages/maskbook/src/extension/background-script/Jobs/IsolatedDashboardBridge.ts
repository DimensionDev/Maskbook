import type { EventBasedChannel } from 'async-call-rpc'
import Services, { BackgroundServicesAdditionalConnections } from '../../service'

export default function () {
    // Listen to API request from dashboard
    if (
        process.env.NODE_ENV === 'development' &&
        process.env.architecture === 'web' &&
        process.env.target === 'chromium'
    ) {
        browser.runtime.onConnectExternal.addListener(listener)
    }
    return () => browser.runtime.onConnectExternal.removeListener(listener)
}
class PortChannel implements EventBasedChannel {
    constructor(public port: browser.runtime.Port) {}
    on(listener: (data: any) => void): void | (() => void) {
        return this.port.onMessage.addListener(listener)
    }
    send(data: any) {
        this.port.postMessage(data)
    }
}

function listener(port: browser.runtime.Port): void {
    if (!(port.name in Services)) port.disconnect()
    BackgroundServicesAdditionalConnections[port.name].newConnection(new PortChannel(port))
}
