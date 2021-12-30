import { RedPacketPluginID } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const RedPacketMessage = createPluginMessage(RedPacketPluginID)
export const RedPacketRPC = createPluginRPC(RedPacketPluginID, () => import('./Worker/services'), RedPacketMessage.rpc)
