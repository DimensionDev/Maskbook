import { createPluginMessage } from '../../utils/createPluginMessage'
import { createPluginRPC, createPluginRPCGenerator } from '../../utils/createPluginRPC'
import { pluginId } from '../constants'

import.meta.webpackHot?.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(pluginId)

export const PluginFileServiceRPC = createPluginRPC(
    pluginId,
    () => import('../Worker/service'),
    PluginFileServiceMessage.events._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    pluginId,
    () => import('../Worker/service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage.events._2,
)
