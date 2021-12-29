import { pluginId } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'

const UnlockProtocolMessage = createPluginMessage(pluginId)
export const PluginUnlockProtocolRPC = createPluginRPC(pluginId, () => import('./Services'), UnlockProtocolMessage.rpc)
