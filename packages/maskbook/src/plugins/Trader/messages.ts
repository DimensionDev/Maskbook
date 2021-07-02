import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { TagType, DataProvider, TradeProvider } from './types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginRPC } from '../utils/createPluginRPC'
import type { TraderProps } from './SNSAdaptor/trader/Trader'

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
export const PluginTraderMessages: WebExtensionMessage<TraderMessage> =
    createPluginMessage<TraderMessage>(PLUGIN_IDENTIFIER)
export const PluginTraderRPC = createPluginRPC(
    PLUGIN_IDENTIFIER,
    () => import('./services'),
    PluginTraderMessages.events.rpc,
)
