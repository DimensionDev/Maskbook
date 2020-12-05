import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { COTM_PluginID } from './constants'

const COTM_Message = createPluginMessage<{ _: unknown }>(COTM_PluginID)

export const PluginCOTM = createPluginRPC(COTM_PluginID, () => import('./services'), COTM_Message.events._)
