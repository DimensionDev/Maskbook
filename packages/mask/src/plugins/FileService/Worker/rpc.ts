import { createPluginMessage, createPluginRPC, createPluginRPCGenerator } from '@masknet/plugin-infra'
import type { _AsyncVersionOf } from 'async-call-rpc'
import { FileServicePluginID } from '../constants'

import.meta.webpackHot && import.meta.webpackHot.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(FileServicePluginID)

export const PluginFileServiceRPC: _AsyncVersionOf<typeof import('./service')> = createPluginRPC(
    FileServicePluginID,
    () => import('./service') as any,
    PluginFileServiceMessage._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    FileServicePluginID,
    () => import('./service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage._2,
)
