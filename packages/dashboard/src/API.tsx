import type { MaskEvents } from '@masknet/shared-base'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { Services as ServiceType } from '../../mask/background/services/types.js'

export let Services: ServiceType = null!
export let Messages: WebExtensionMessage<MaskEvents> = null!

export function setService(rpc: any) {
    Services = rpc
    Object.assign(globalThis, { Services: rpc })
}

export function setMessages(MaskMessage: any) {
    Messages = MaskMessage
    Object.assign(globalThis, { Messages: MaskMessage })
}
