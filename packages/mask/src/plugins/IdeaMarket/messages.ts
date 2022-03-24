import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { IDEAMARKET_PLUGIN_ID } from './constants'

export interface IdeaMarketMessages {
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const PluginIdeaMarketMessages: PluginMessageEmitter<IdeaMarketMessages> = createPluginMessage(IDEAMARKET_PLUGIN_ID)
export const PluginIdeaMarketRPC = createPluginRPC(
    IDEAMARKET_PLUGIN_ID,
    () => import('./services'),
    PluginIdeaMarketMessages.rpc,
)
