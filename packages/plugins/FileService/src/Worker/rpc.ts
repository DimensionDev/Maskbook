import { createPluginMessage, createPluginRPC, createPluginRPCGenerator } from '@masknet/plugin-infra'
import { PluginID_FileService } from '@masknet/shared-base'

import.meta.webpackHot && import.meta.webpackHot.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(PluginID_FileService)

export const PluginFileServiceRPC = createPluginRPC<Omit<typeof import('./service'), 'upload' | 'setupDatabase'>>(
    PluginID_FileService,
    () => import('./service').then(({ upload, setupDatabase, ...rest }) => rest),
    PluginFileServiceMessage._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    PluginID_FileService,
    () => import('./service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage._2,
)
