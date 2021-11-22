import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { ALLBLUE_PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginAllblueMessages = createPluginMessage(ALLBLUE_PLUGIN_ID)
export const PluginAllblueRPC = createPluginRPC(
    ALLBLUE_PLUGIN_ID,
    () => import('./Worker/services'),
    PluginAllblueMessages.rpc,
)
