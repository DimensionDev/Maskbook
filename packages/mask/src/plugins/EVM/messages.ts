import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const EVM_Message = createPluginMessage(PLUGIN_ID)
export const EVM_RPC = createPluginRPC(PLUGIN_ID, () => import('./services'), EVM_Message.rpc)
