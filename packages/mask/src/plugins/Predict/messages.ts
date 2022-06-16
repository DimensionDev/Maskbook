import { createPluginMessage, createPluginRPC, PluginMessageEmitter, PluginId } from '@masknet/plugin-infra'

export interface PredictMessages {
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const PluginPredictMessages: PluginMessageEmitter<PredictMessages> = createPluginMessage(PluginId.Predict)
export const PluginPredictRPC = createPluginRPC(PluginId.Predict, () => import('./services'), PluginPredictMessages.rpc)
