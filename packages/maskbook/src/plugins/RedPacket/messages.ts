import { RedPacketPluginID } from './constants'
import { createPluginMessage } from '@masknet/plugin-infra'
import { createPluginRPC } from '../utils/createPluginRPC'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const RedPacketMessage = createPluginMessage(RedPacketPluginID)
export const RedPacketRPC = createPluginRPC(RedPacketPluginID, () => import('./Worker/services'), RedPacketMessage.rpc)
