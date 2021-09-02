import { RedPacketPluginID, RedPacketNftPluginID } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const RedPacketMessage = createPluginMessage(RedPacketPluginID)
const RedPacketNftMessage = createPluginMessage(RedPacketNftPluginID)
export const RedPacketRPC = createPluginRPC(RedPacketPluginID, () => import('./Worker/services'), RedPacketMessage.rpc)
export const RedPacketNftRPC = createPluginRPC(
    RedPacketNftPluginID,
    () => import('./Worker/servicesForNft'),
    RedPacketNftMessage.rpc,
)
