import { Election2020PluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

const ElectionMessage = createPluginMessage<{ _: unknown }>(Election2020PluginID)

export const PluginElection2020 = createPluginRPC(
    Election2020PluginID,
    () => import('./services'),
    ElectionMessage.events._,
)
