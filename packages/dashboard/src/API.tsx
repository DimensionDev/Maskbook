import type { EventBasedChannel } from 'async-call-rpc'

type ServiceType = typeof import('@dimensiondev/maskbook/src/extension/service')['Services']

export let Services: ServiceType = null!
export function setService(x: ServiceType) {
    Services = x
}
export class WebExtensionExternalChannel implements EventBasedChannel {
    private f = new Set<Function>()
    private connection: browser.runtime.Port
    constructor(name: string, id = 'jkoeaghipilijlahjplgbfiocjhldnap') {
        this.connection = browser.runtime.connect(id, { name })
        this.connection.onMessage.addListener((m) => this.f.forEach((f) => f(m)))
    }
    on(listener: Function) {
        this.f.add(listener)
        return () => this.f.delete(listener)
    }
    send(m: any) {
        this.connection.postMessage(m)
    }
}
