import { createPluginMessage, createPluginRPC, createPluginRPCGenerator } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'

// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
import.meta.webpackHot && import.meta.webpackHot.accept()

const PluginFileServiceMessage = createPluginMessage<{ _: unknown; _2: unknown }>(PluginID.FileService)

export const PluginFileServiceRPC = createPluginRPC<Omit<typeof import('./service.js'), 'upload' | 'setupDatabase'>>(
    PluginID.FileService,
    () => import('./service.js').then(({ upload, setupDatabase, ...rest }) => rest),
    PluginFileServiceMessage._,
)

export const PluginFileServiceRPCGenerator = createPluginRPCGenerator(
    PluginID.FileService,
    () => import('./service.js').then(({ upload }) => ({ upload })),
    PluginFileServiceMessage._2,
)
