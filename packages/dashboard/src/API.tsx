// This file includes the API bridge to the Mask Network extension
// In isolated mode, set up at ./initialization/isolated_bridge
// In intergrated mode, set up at /packages/maskbook/src/extension/dashboard/index

import type { Services as ServiceType } from '../../maskbook/dist/extension/service'
import type { MaskMessage } from '../../maskbook/dist/utils/messages'
export let Services: typeof ServiceType = null!
export let Messages: typeof MaskMessage = null!
export let PluginServices: PluginServices = null!
export let PluginMessages: PluginMessages = null!
export interface PluginServices {
    Wallet: typeof import('../../maskbook/dist/plugins/Wallet/messages').WalletRPC
}
export interface PluginMessages {
    Wallet: typeof import('../../maskbook/dist/plugins/Wallet/messages').WalletMessages
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
