import { createPluginMessage, createPluginRPC, PluginMessageEmitter, PluginId } from '@masknet/plugin-infra'

export interface IdeaMarketMessages {
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const PluginIdeaMarketMessages: PluginMessageEmitter<IdeaMarketMessages> = createPluginMessage(PluginId.IdeaMarket)
export const PluginIdeaMarketRPC = createPluginRPC(
    PluginId.IdeaMarket,
    () => import('./services'),
    PluginIdeaMarketMessages.rpc,
)
