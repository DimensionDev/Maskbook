// This file includes the API bridge to the Mask Network extension
// In isolated mode, set up at ./initialization/isolated_bridge
// In integrated mode, set up at /packages/mask/src/extension/dashboard/index

import type { DashboardPluginMessages, DashboardPluginServices } from '@masknet/shared'
import type { Services as ServiceType } from '../../mask/dist/src/extension/service'
import type { MaskEvents } from '@masknet/shared-base'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { WalletMessages } from '@masknet/plugin-wallet'

export let Services: typeof ServiceType = null!
export let Messages: WebExtensionMessage<MaskEvents> = null!
export let PluginServices: PluginServices = null!
export let PluginMessages: PluginMessages = null!
export interface PluginServices extends DashboardPluginServices {
    Wallet: typeof import('../../mask/dist/src/plugins/Wallet/messages').WalletRPC
    Swap: typeof import('../../mask/dist/src/plugins/Trader/messages').PluginTraderRPC
    Pets: typeof import('../../mask/dist/src/plugins/Pets/messages').PluginPetRPC
}
export interface PluginMessages extends DashboardPluginMessages {
    Wallet: typeof WalletMessages
    Transak: typeof import('../../mask/dist/src/plugins/Transak/messages').PluginTransakMessages
    Swap: typeof import('../../mask/dist/src/plugins/Trader/messages').PluginTraderMessages
    Pets: typeof import('../../mask/dist/src/plugins/Pets/messages').PluginPetMessages
}
export function setService(rpc: any) {
    Services = rpc
    Object.assign(globalThis, { Services: rpc })
}
export function setMessages(MaskMessage: any) {
    Messages = MaskMessage
    Object.assign(globalThis, { Messages: MaskMessage })
}
export function setPluginServices(rpc: DashboardPluginServices) {
    PluginServices = rpc as any
    Object.assign(globalThis, { PluginServices: rpc })
}

export function setPluginMessages(message: DashboardPluginMessages) {
    PluginMessages = message as any
    Object.assign(globalThis, { PluginMessages: message })
}
