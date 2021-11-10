import type { TagType } from './types'
import type { DataProvider, TradeProvider } from '@masknet/public-api'
import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from './constants'
import type { TraderProps } from './SNSAdaptor/trader/Trade'

interface CashTagEvent {
    name: string
    type: TagType
    element: HTMLAnchorElement | null
    dataProviders: DataProvider[]
    tradeProviders: TradeProvider[]
}

interface SwapSettingsEvent {
    open: boolean
}

interface SwapConfirmationEvent {
    open: boolean
}

interface SwapDialogEvent {
    open: boolean
    traderProps?: TraderProps
}

export interface TraderMessage {
    /**
     * View a cash tag
     */
    cashTagObserved: CashTagEvent

    /**
     * Swap settings dialog
     */
    swapSettingsUpdated: SwapSettingsEvent

    /**
     * Confirm swap dialog
     */
    swapConfirmationUpdated: SwapConfirmationEvent

    /**
     * Swap dialog
     */
    swapDialogUpdated: SwapDialogEvent

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTraderMessages: PluginMessageEmitter<TraderMessage> = createPluginMessage(PLUGIN_IDENTIFIER)
export const PluginTraderRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), PluginTraderMessages.rpc)
