import { getPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

import.meta.webpackHot?.accept()
export const PluginEFPRPC = getPluginRPC<typeof import('./Worker/apis/index.js')>(PLUGIN_ID)
