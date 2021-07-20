import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginMessage } from '@masknet/plugin-infra'
import { createPluginRPC } from '../utils/createPluginRPC'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginCollectibleMessage = createPluginMessage(PLUGIN_IDENTIFIER)
export const PluginCollectibleRPC = createPluginRPC(
    PLUGIN_IDENTIFIER,
    () => import('./services'),
    PluginCollectibleMessage.rpc,
)
