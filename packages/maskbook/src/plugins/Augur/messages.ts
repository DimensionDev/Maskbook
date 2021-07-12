import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { AUGUR_PLUGIN_ID } from './constants'

interface AugurMessages {
    rpc: unknown
}

export const PluginAugurMessages: WebExtensionMessage<AugurMessages> =
    createPluginMessage<AugurMessages>(AUGUR_PLUGIN_ID)

export const PluginAugurRPC = createPluginRPC(
    AUGUR_PLUGIN_ID,
    () => import('./services'),
    PluginAugurMessages.events.rpc,
)
