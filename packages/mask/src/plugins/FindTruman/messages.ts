import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { FIND_TRUMAN_PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginFindTrumanMessages = createPluginMessage(FIND_TRUMAN_PLUGIN_ID)
export const PluginFindTrumanRPC = createPluginRPC(
    FIND_TRUMAN_PLUGIN_ID,
    () => import('./Worker/services'),
    PluginFindTrumanMessages.rpc,
)
