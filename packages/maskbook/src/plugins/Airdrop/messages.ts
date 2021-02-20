import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { AirdropPluginID } from './constants'

if (module.hot) module.hot.accept()
const AirdropMessage = createPluginMessage<{ _: unknown }>(AirdropPluginID)
export const PluginAirdrop = createPluginRPC(AirdropPluginID, () => import('./services'), AirdropMessage.events._)
