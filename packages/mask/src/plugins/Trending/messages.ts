import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { DataProvider } from '@masknet/public-api'
import { PLUGIN_ID } from './constants'
import type { TagType } from './types'

export interface CashTagEvent {
    name: string
    type: TagType
    element: HTMLAnchorElement | null
    dataProviders: DataProvider[]
}

export interface TraderMessage {
    /**
     * View a cash tag
     */
    cashTagObserved: CashTagEvent

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTraderMessages: PluginMessageEmitter<TraderMessage> = createPluginMessage(PLUGIN_ID)
export const PluginTraderRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), PluginTraderMessages.rpc)
