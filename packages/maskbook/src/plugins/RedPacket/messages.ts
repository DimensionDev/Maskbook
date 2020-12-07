import { RedPacketPluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

export interface RedPacketMessages {
    redPacketUpdated: void
    rpc: unknown
}
export const RedPacketMessage = createPluginMessage<RedPacketMessages>(RedPacketPluginID)
export const RedPacketRPC = createPluginRPC(RedPacketPluginID, () => import('./services'), RedPacketMessage.events.rpc)
