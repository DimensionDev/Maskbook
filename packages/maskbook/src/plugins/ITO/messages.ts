import { ITO_PluginID } from './constants'
import { createPluginMessage } from '@masknet/plugin-infra'
import { createPluginRPC } from '../utils/createPluginRPC'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginITO_Messages = createPluginMessage(ITO_PluginID)
export const PluginITO_RPC = createPluginRPC(ITO_PluginID, () => import('./Worker/services'), PluginITO_Messages.rpc)
