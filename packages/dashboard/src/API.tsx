import type { Services as ServiceType } from '../../maskbook/dist/src/extension/service'
import type { MaskMessage } from '../../maskbook/dist/src/utils/messages'
export let Services: typeof ServiceType = null!
export let Messages: typeof MaskMessage = null!
export let PluginServices: PluginServices = null!
export let PluginMessages: PluginMessages = null!
export interface PluginServices {
    Wallet: typeof import('../../maskbook/dist/src/plugins/Wallet/messages').WalletRPC
}
export interface PluginMessages {
    Wallet: typeof import('../../maskbook/dist/src/plugins/Wallet/messages').WalletMessages
}
export function setService(x: typeof ServiceType) {
    Services = x
    Object.assign(globalThis, { Services: x })
}
export function setMessages(x: typeof Messages) {
    Messages = x
    Object.assign(globalThis, { Messages: x })
}
export function setPluginServices(x: typeof PluginServices) {
    PluginServices = x
    Object.assign(globalThis, { PluginServices: x })
}

export function setPluginMessages(x: typeof PluginMessages) {
    PluginMessages = x
    Object.assign(globalThis, { PluginMessages: x })
}
