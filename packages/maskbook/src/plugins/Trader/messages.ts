import type { DataProvider, TagType } from './types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginRPC } from '../utils/createPluginRPC'
import type { TraderProps } from './UI/trader/Trader'

interface CashTagEvent {
    name: string
    type: TagType
    element: HTMLAnchorElement | null
    dataProviders: DataProvider[]
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

interface PluginTraderMessage {
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

if (module.hot) module.hot.accept()
export const PluginTraderMessages = createPluginMessage<PluginTraderMessage>(PLUGIN_IDENTIFIER)
export const PluginTraderRPC = createPluginRPC(
    PLUGIN_IDENTIFIER,
    () => import('./services'),
    PluginTraderMessages.events.rpc,
)
