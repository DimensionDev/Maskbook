import { GameePluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

if (module.hot) module.hot.accept()
const GameeMessage = createPluginMessage<{ _: unknown }>(GameePluginID)
export const PluginGammeRPC = createPluginRPC(GameePluginID, () => import('./services'), GameeMessage.events._)
