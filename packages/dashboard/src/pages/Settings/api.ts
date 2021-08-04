import { createGlobalState } from '@masknet/shared'
import { Services, Messages } from '../../API'
import type { DataProvider } from '@masknet/public-api'
export const [useLanguage] = createGlobalState(Services.Settings.getLanguage, (x) =>
    Messages.events.languageSettings.on(x),
)

export const [useTrendingDataSource] = createGlobalState<DataProvider>(Services.Settings.getTrendingDataSource, (x) =>
    Messages.events.currentTrendingDataProviderSettings.on(x),
)

export const [useEthNetworkTradeProvider] = createGlobalState(Services.Settings.getEthNetworkTradeProvider, (x) =>
    Messages.events.ethNetworkTradeProviderSettings.on(x),
)

export const [usePolygonNetworkTradeProvider] = createGlobalState(
    Services.Settings.getPolygonNetworkTradeProvider,
    (x) => Messages.events.polygonNetworkTradeProviderSettings.on(x),
)

export const [useBscNetworkTradeProvider] = createGlobalState(Services.Settings.getBscNetworkTradeProvider, (x) =>
    Messages.events.bscNetworkTradeProviderSettings.on(x),
)
