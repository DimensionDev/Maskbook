import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

const MaskBoxMessages = createPluginMessage(PLUGIN_ID)
export const MaskBoxRPC = createPluginRPC(PLUGIN_ID, () => import('./services.js'), MaskBoxMessages.rpc)
