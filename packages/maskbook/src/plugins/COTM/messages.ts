import { COTM_PluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

const COTM_Message = createPluginMessage<{ _: unknown }>(COTM_PluginID)
export const PluginCOTM = createPluginRPC(COTM_PluginID, () => import('./services'), COTM_Message.events._)
