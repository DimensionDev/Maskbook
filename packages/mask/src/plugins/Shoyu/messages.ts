import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { SHOYU_PLUGIN_ID } from './constants'

interface ShoyuMessages {
    rpc: unknown
}

export const PluginShoyuMessage: PluginMessageEmitter<ShoyuMessages> =
    createPluginMessage(SHOYU_PLUGIN_ID)
export const PluginShoyuRPC = createPluginRPC(SHOYU_PLUGIN_ID, () => import('./services'), PluginShoyuMessage.rpc)
)
