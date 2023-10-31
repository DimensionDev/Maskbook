import { getPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

import.meta.webpackHot?.accept()

export const PluginScamRPC = getPluginRPC<typeof import('./Worker/rpc.js')>(PLUGIN_ID)
