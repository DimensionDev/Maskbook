import { getPluginRPC, getPluginRPCGenerator } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import type { upload } from '../Worker/service.js'

import.meta.webpackHot?.accept()

export const PluginFileServiceRPC = getPluginRPC<Omit<typeof import('../Worker/service.js'), 'upload'>>(
    PluginID.FileService,
)
export const PluginFileServiceRPCGenerator = getPluginRPCGenerator<{ upload: typeof upload }>(PluginID.FileService)
