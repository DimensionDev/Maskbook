import { createPluginMessage, PluginMessageEmitter, createPluginRPC, PluginId } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
export interface NFTAvatarMessage {
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginPetMessages: { events: PluginMessageEmitter<NFTAvatarMessage> } = {
    events: createPluginMessage<NFTAvatarMessage>(PluginId.NFTAvatar, serializer),
}

export const PluginPetRPC = createPluginRPC(
    PluginId.NFTAvatar,
    () => import('./Services'),
    PluginPetMessages.events.rpc,
)
