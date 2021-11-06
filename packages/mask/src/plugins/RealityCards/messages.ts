import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { REALITYCARDS_PLUGIN_ID } from './constants'

interface RealityCardsMessages {
    rpc: unknown
}

export const PluginRealityCardsMessages: PluginMessageEmitter<RealityCardsMessages> =
    createPluginMessage(REALITYCARDS_PLUGIN_ID)

export const PluginRealityCardsRPC = createPluginRPC(
    REALITYCARDS_PLUGIN_ID,
    () => import('./services'),
    PluginRealityCardsMessages.rpc,
)
