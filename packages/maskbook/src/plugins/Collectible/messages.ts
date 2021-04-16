import { PLUGIN_IDENTIFIER } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

interface AcceptOfferDialogEvent {
    open: boolean
}

interface CollectibleMessage {
    rpc: unknown
    acceptOfferDialogEvent: AcceptOfferDialogEvent
}

if (module.hot) module.hot.accept()
export const PluginCollectibleMessage = createPluginMessage<CollectibleMessage>(PLUGIN_IDENTIFIER)
export const PluginCollectibleRPC = createPluginRPC(
    PLUGIN_IDENTIFIER,
    () => import('./services'),
    PluginCollectibleMessage.events.rpc,
)
