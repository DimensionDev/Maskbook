import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { Services as ServiceType } from '../../maskbook/dist/src/extension/service'

export let Services: typeof ServiceType = null!
export function setService(x: typeof ServiceType) {
    Services = x
    Object.assign(globalThis, { Services: x })
}
export class WebExtensionExternalChannel extends WebExtensionMessage<any> {
    constructor(domain: string, id = 'jkoeaghipilijlahjplgbfiocjhldnap') {
        super({ externalExtensionID: id, domain })
    }
}
