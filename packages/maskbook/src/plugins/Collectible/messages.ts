import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
interface CollectibleMessage {
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginCollectibleMessage: WebExtensionMessage<CollectibleMessage> =
    createPluginMessage<CollectibleMessage>(PLUGIN_IDENTIFIER)
export const PluginCollectibleRPC = createPluginRPC(
    PLUGIN_IDENTIFIER,
    () => import('./services'),
    PluginCollectibleMessage.events.rpc,
)
