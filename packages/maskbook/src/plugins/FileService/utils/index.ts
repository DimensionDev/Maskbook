import { createPluginMessage } from '../../utils/createPluginMessage'
import { createPluginRPC, createPluginRPCGenerator } from '../../utils/createPluginRPC'
import { pluginId } from '../constants'

if (module.hot) module.hot.accept()
const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(pluginId)
export const PluginFileServiceRPC = createPluginRPC(
    pluginId,
    () => import('../service'),
    PluginFileServiceMessage.events._,
)
export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    pluginId,
    () => import('../service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage.events._2,
)
