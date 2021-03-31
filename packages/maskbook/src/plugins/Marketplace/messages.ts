import { MarketplacePluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'

if (module.hot) module.hot.accept()
const MarketplaceMessage = createPluginMessage<{ _: unknown }>(MarketplacePluginID)
export const PluginMarketplaceRPC = createPluginRPC(
    MarketplacePluginID,
    () => import('./services'),
    MarketplaceMessage.events._,
)
