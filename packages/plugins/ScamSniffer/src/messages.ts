import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { PLUGIN_ID } from './constants.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

export const PluginMessages = createPluginMessage(PLUGIN_ID, serializer)
export const PluginScamRPC = createPluginRPC(PLUGIN_ID, () => import('./Services/index.js'), PluginMessages.rpc)
