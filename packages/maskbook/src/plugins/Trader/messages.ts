import type { DataProvider } from './types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginRPC } from '../utils/createPluginRPC'

interface CashTagEvent {
    name: string
    element: HTMLAnchorElement | null
    availablePlatforms: DataProvider[]
}

interface PluginTraderMessage {
    /**
     * View a cash tag
     */
    cashTagObserved: CashTagEvent
    rpc: unknown
}

export const PluginTraderMessages = createPluginMessage<PluginTraderMessage>(PLUGIN_IDENTIFIER)
export const PluginTraderRPC = createPluginRPC(() => import('./services'), PluginTraderMessages.events.rpc)
