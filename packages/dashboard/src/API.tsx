import type { Services as ServiceType } from '../../mask/background/services/types.js'
import type { MaskEvents } from '@masknet/shared-base'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { PluginMessageEmitterItem } from '@masknet/plugin-infra'

export let Services: ServiceType = null!
export let Messages: WebExtensionMessage<MaskEvents> = null!

export interface PluginMessages {
    Transak: {
        buyTokenDialogUpdated: PluginMessageEmitterItem<
            | {
                  open: true
                  code?: string
                  address: string
              }
            | { open: false }
        >
    }
}
export function setService(rpc: any) {
    Services = rpc
    Object.assign(globalThis, { Services: rpc })
}
export function setMessages(MaskMessage: any) {
    Messages = MaskMessage
    Object.assign(globalThis, { Messages: MaskMessage })
}
