import { ITO_PluginID } from './constants.js'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginITO_Messages = createPluginMessage(ITO_PluginID)
export const PluginITO_RPC = createPluginRPC(ITO_PluginID, () => import('./Worker/services.js'), PluginITO_Messages.rpc)
