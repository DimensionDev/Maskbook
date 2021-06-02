import { RedPacketPluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

export interface RedPacketMessages {
    redPacketUpdated: void
    rpc: unknown
}
if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const RedPacketMessage = createPluginMessage<RedPacketMessages>(RedPacketPluginID)
export const RedPacketRPC = createPluginRPC(RedPacketPluginID, () => import('./services'), RedPacketMessage.events.rpc)
