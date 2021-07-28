import { createGlobalState } from '@masknet/shared'
import { Services, Messages } from '../../API'

export const [useLanguage] = createGlobalState(Services.Settings.getLanguage, (x) =>
    Messages.events.languageSettings.on(x),
)

export const [useTrendingDataSource] = createGlobalState(Services.Settings.getTrendingDataSource, (x) =>
    Messages.events.currentTrendingDataProviderSettings.on(x),
)
