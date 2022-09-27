import { createPluginMessage, createPluginRPC, PluginMessageEmitter, PluginID } from '@masknet/plugin-infra'

export interface PredictMessages {
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const PluginPredictMessages: PluginMessageEmitter<PredictMessages> = createPluginMessage(PluginID.Predict)
export const PluginPredictRPC = createPluginRPC(PluginID.Predict, () => import('./services'), PluginPredictMessages.rpc)
