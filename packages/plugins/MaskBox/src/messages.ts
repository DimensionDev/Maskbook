import { getPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

export const MaskBoxRPC = getPluginRPC<typeof import('./apis/index.js')>(PLUGIN_ID)
