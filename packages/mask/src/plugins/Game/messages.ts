import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { GamePluginID } from './constants'
import type { GameDialogEvent } from './types'
export interface GameMessage {
    /**
     * Pets essay set dialog
     */
    essayDialogUpdated: GameDialogEvent
    setResult: number
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginGameMessages: { events: PluginMessageEmitter<GameMessage> } = {
    events: createPluginMessage<GameMessage>(GamePluginID, serializer),
}

export const PluginGameRPC = createPluginRPC(GamePluginID, () => import('./Services'), PluginGameMessages.events.rpc)
