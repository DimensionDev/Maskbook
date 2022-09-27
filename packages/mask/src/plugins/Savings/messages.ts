import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { SAVINGS_PLUGIN_ID } from './constants.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginSavingsMessages = createPluginMessage(SAVINGS_PLUGIN_ID)
export const PluginSavingsRPC = createPluginRPC(
    SAVINGS_PLUGIN_ID,
    () => import('./Worker/services.js'),
    PluginSavingsMessages.rpc,
)
