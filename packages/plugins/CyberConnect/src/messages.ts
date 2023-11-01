import { getPluginRPC } from '@masknet/plugin-infra'
import { CYBERCONNECT_PLUGIN_ID } from './constants.js'

import.meta.webpackHot?.accept()
export const PluginCyberConnectRPC = getPluginRPC<typeof import('./Worker/apis/index.js')>(CYBERCONNECT_PLUGIN_ID)
