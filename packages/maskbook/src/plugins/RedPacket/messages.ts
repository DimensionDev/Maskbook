import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { RedPacketPluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

export interface RedPacketMessages {
    redPacketUpdated: void
    _: unknown
}
if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const RedPacketMessage: WebExtensionMessage<RedPacketMessages> =
    createPluginMessage<RedPacketMessages>(RedPacketPluginID)
export const RedPacketRPC = createPluginRPC(
    RedPacketPluginID,
    () => import('./Worker/services'),
    RedPacketMessage.events._,
)
