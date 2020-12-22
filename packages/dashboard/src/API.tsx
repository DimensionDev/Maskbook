import type { EventBasedChannel } from 'async-call-rpc'

type ServiceType = typeof import('@dimensiondev/maskbook/src/extension/service')['Services']

export let Services: ServiceType = null!
export function setService(x: ServiceType) {
    Services = x
    console.log(x.Welcome.queryPermission({}))
}
export class WebExtensionExternalChannel implements EventBasedChannel {
    private f = new Set<Function>()
    private connection: browser.runtime.Port
    constructor(name: string, id = 'jkoeaghipilijlahjplgbfiocjhldnap') {
        // @ts-expect-error Chrome only
        this.connection = chrome.runtime.connect(id, { name })
        // @ts-expect-error Chrome only
        const err = chrome.runtime.lastError
        if (err) console.log(err)
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
