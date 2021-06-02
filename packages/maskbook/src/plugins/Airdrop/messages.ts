import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { AirdropPluginID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const AirdropMessage = createPluginMessage<{ _: unknown }>(AirdropPluginID)
export const PluginAirdropRPC = createPluginRPC(AirdropPluginID, () => import('./services'), AirdropMessage.events._)
