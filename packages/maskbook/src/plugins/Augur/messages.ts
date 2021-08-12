import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { AUGUR_PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginAugurMessages = createPluginMessage(AUGUR_PLUGIN_ID)
export const PluginAugurRPC = createPluginRPC(AUGUR_PLUGIN_ID, () => import('./services'), PluginAugurMessages.rpc)
