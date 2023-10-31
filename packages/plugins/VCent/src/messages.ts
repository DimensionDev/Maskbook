import { getPluginMessage, type PluginMessageEmitter, getPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

interface VCentMessages {
    rpc: unknown
}

const PluginVCentMessages: PluginMessageEmitter<VCentMessages> = getPluginMessage(PLUGIN_ID)
export const PluginVCentRPC = getPluginRPC<typeof import('./apis/index.js')>(PLUGIN_ID)
