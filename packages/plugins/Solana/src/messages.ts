import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const SolanaMessage = createPluginMessage(PLUGIN_ID)
export const SolanaRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), SolanaMessage.rpc)
