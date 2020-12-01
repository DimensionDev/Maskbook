import { ITO_PluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

const ITO_Message = createPluginMessage<{ _: unknown }>(ITO_PluginID)
export const PluginITO = createPluginRPC(ITO_PluginID, () => import('./services'), ITO_Message.events._)
