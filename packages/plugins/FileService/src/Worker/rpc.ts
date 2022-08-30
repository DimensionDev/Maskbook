import { createPluginMessage, createPluginRPC, createPluginRPCGenerator, PluginId } from '@masknet/plugin-infra'

import.meta.webpackHot && import.meta.webpackHot.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(PluginId.FileService)

export const PluginFileServiceRPC = createPluginRPC<Omit<typeof import('./service.js'), 'upload' | 'setupDatabase'>>(
    PluginId.FileService,
    () => import('./service.js').then(({ upload, setupDatabase, ...rest }) => rest),
    PluginFileServiceMessage._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    PluginId.FileService,
    () => import('./service.js').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage._2,
)
