import { createPluginMessage } from '../../utils/createPluginMessage'
import { createPluginRPC, createPluginRPCGenerator } from '../../utils/createPluginRPC'
import { FileServicePluginID } from '../constants'

import.meta.webpackHot?.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(FileServicePluginID)

export const PluginFileServiceRPC = createPluginRPC(
    FileServicePluginID,
    () => import('../Worker/service'),
    PluginFileServiceMessage.events._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    FileServicePluginID,
    () => import('../Worker/service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage.events._2,
)
