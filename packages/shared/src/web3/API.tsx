// This file includes the API bridge to the Mask Network extension
// In isolated mode, set up at ./initialization/isolated_bridge
// In integrated mode, set up at /packages/mask/src/extension/dashboard/index

import type { DashboardPluginMessages, DashboardPluginServices } from '@masknet/shared'

export const PluginServices: PluginServices = null!
export const PluginMessages: PluginMessages = null!
export interface PluginServices extends DashboardPluginServices {
    Wallet: typeof import('../../../mask/dist/src/plugins/Wallet/messages').WalletRPC
}
export interface PluginMessages extends DashboardPluginMessages {
    Wallet: typeof import('../../../plugins/Wallet/dist/messages').WalletMessages
}
