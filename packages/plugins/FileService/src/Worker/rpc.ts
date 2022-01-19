import { createPluginMessage, createPluginRPC, createPluginRPCGenerator, PluginId } from '@masknet/plugin-infra'

import.meta.webpackHot && import.meta.webpackHot.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(PluginId.FileService)

export const PluginFileServiceRPC = createPluginRPC<Omit<typeof import('./service'), 'upload' | 'setupDatabase'>>(
    PluginId.FileService,
    () => import('./service').then(({ upload, setupDatabase, ...rest }) => rest),
    PluginFileServiceMessage._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    PluginId.FileService,
    () => import('./service').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage._2,
)
