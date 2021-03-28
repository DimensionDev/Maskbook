import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

interface CollectibleMessage {
    rpc: unknown
}

if (module.hot) module.hot.accept()
export const PluginCollectiblesMessage = createPluginMessage<CollectibleMessage>(PLUGIN_IDENTIFIER)
export const PluginCollectiblesRPC = createPluginRPC(
    PLUGIN_IDENTIFIER,
    () => import('./services'),
    PluginCollectiblesMessage.events.rpc,
)
