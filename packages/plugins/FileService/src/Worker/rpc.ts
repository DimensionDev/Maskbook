import { createPluginMessage, createPluginRPC, createPluginRPCGenerator } from '@masknet/plugin-infra'
import { FileServicePluginID } from '../constants'

import.meta.webpackHot && import.meta.webpackHot.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(FileServicePluginID)

export const PluginFileServiceRPC = createPluginRPC(
    FileServicePluginID,
    () => import('./service').then(({ upload, ...rest }) => rest),
    PluginFileServiceMessage._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    FileServicePluginID,
    () => import('./service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage._2,
)
