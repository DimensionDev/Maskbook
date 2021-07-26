import { createPluginMessage } from '@masknet/plugin-infra'
import { createPluginRPC, createPluginRPCGenerator } from '../../utils/createPluginRPC'
import { FileServicePluginID } from '../constants'

import.meta.webpackHot?.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(FileServicePluginID)

export const PluginFileServiceRPC = createPluginRPC(
    FileServicePluginID,
    () => import('./service'),
    PluginFileServiceMessage._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    FileServicePluginID,
    () => import('./service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage._2,
)
