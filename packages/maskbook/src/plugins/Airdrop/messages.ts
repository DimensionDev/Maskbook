import { createPluginMessage } from '@masknet/plugin-infra'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const AirdropMessage = createPluginMessage(PLUGIN_ID)
export const AirdropRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), AirdropMessage.rpc)
