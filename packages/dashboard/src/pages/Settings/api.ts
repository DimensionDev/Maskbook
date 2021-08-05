import { createGlobalState } from '@masknet/shared'
import { Services, Messages } from '../../API'
import type { DataProvider } from '@masknet/public-api'
export const [useLanguage] = createGlobalState(Services.Settings.getLanguage, Messages.events.languageSettings.on)

export const [useTrendingDataSource] = createGlobalState<DataProvider>(
    Services.Settings.getTrendingDataSource,
    Messages.events.currentTrendingDataProviderSettings.on,
)

export const [useEthereumNetworkTradeProvider] = createGlobalState(
    Services.Settings.getEthereumNetworkTradeProvider,
    Messages.events.ethereumNetworkTradeProviderSettings.on,
)

export const [usePolygonNetworkTradeProvider] = createGlobalState(
    Services.Settings.getPolygonNetworkTradeProvider,
    Messages.events.polygonNetworkTradeProviderSettings.on,
)

export const [useBinanceNetworkTradeProvider] = createGlobalState(
    Services.Settings.getBinanceNetworkTradeProvider,
    Messages.events.BinanceNetworkTradeProviderSettings.on,
)
