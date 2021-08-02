// This file includes the API bridge to the Mask Network extension
// In isolated mode, set up at ./initialization/isolated_bridge
// In intergrated mode, set up at /packages/maskbook/src/extension/dashboard/index

import type { DashboardPluginMessages, DashboardPluginServices } from '@masknet/shared'
import type { Services as ServiceType } from '../../maskbook/dist/extension/service'
import type { MaskMessage } from '../../maskbook/dist/utils/messages'
import type { WalletMessages } from '@masknet/plugin-wallet'

export let Services: typeof ServiceType = null!
export let Messages: typeof MaskMessage = null!
export let PluginServices: PluginServices = null!
export let PluginMessages: PluginMessages = null!
export interface PluginServices extends DashboardPluginServices {
    Wallet: typeof import('../../maskbook/dist/plugins/Wallet/messages').WalletRPC
    Swap: typeof import('../../maskbook/dist/plugins/Trader/messages').PluginTraderRPC
}
export interface PluginMessages extends DashboardPluginMessages {
    Wallet: typeof WalletMessages
    Transak: typeof import('../../maskbook/dist/plugins/Transak/messages').PluginTransakMessages
    Swap: typeof import('../../maskbook/dist/plugins/Trader/messages').PluginTraderMessages
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
