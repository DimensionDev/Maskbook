import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { GamePluginID } from './constants.js'
import type { GameDialogEvent } from './types.js'
export interface GameMessage {
    /**
     * Pets essay set dialog
     */
    gameDialogUpdated: GameDialogEvent
    setResult: number
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginGameMessages: {
    events: PluginMessageEmitter<GameMessage>
} = {
    events: createPluginMessage<GameMessage>(GamePluginID, serializer),
}
