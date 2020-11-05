import type { DataProvider } from './types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { PLUGIN_IDENTIFIER } from './constants'

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
}

export const PluginTraderMessages = createPluginMessage<PluginTraderMessage>(PLUGIN_IDENTIFIER)
