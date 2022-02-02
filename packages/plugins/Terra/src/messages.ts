import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const TerraMessage = createPluginMessage(PLUGIN_ID)
export const TerraRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), TerraMessage.rpc)
