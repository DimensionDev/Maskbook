import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { DataProvider } from '@masknet/public-api'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants/index.js'
import type { TagType } from './types/index.js'

interface CashAnchorEvent {
    name: string
    address?: string
    type: TagType
    element: HTMLElement | null
    dataProviders: DataProvider[]
}

interface SwapSettingsEvent {
    open: boolean
    gasConfig?: GasConfig
}

export interface TraderMessage {
    /**
     * View a cash tag
     */
    cashAnchorObserved: CashAnchorEvent

    /**
     * Swap settings dialog
     */
    swapSettingsUpdated: SwapSettingsEvent

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTraderMessages: PluginMessageEmitter<TraderMessage> = createPluginMessage(PLUGIN_ID)
export const PluginTraderRPC = createPluginRPC(PLUGIN_ID, () => import('./services.js'), PluginTraderMessages.rpc)
