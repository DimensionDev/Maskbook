import { PLUGIN_ID } from './constants.js'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'

const UnlockProtocolMessage = createPluginMessage(PLUGIN_ID)
export const PluginUnlockProtocolRPC = createPluginRPC(
    PLUGIN_ID,
    () => import('./Services.js'),
    UnlockProtocolMessage.rpc,
)
