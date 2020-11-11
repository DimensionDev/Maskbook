import { createPluginMessage } from '../../utils/createPluginMessage'
import { createPluginRPC, createPluginRPCGenerator } from '../../utils/createPluginRPC'
import { pluginId } from '../constants'
export * from './date'

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(pluginId)
export const PluginFileServiceRPC = createPluginRPC(() => import('../service'), PluginFileServiceMessage.events._)
export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    () => import('../service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage.events._2,
)
