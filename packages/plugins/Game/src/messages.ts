import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { GamePluginID } from './constants.js'
export interface GameMessage {
    /**
     * Pets essay set dialog
     */
    setResult: number
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginGameMessages: {
    events: PluginMessageEmitter<GameMessage>
} = {
    events: createPluginMessage<GameMessage>(GamePluginID, serializer),
}
