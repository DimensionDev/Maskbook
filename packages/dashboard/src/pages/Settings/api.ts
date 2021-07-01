import { createGlobalState } from '@masknet/shared'
import { Services, Messages } from '../../API'

export const [useLanguage] = createGlobalState(Services.Settings.getLanguage, (x) =>
    Messages.events.languageSettings.on(x),
)

export const [useTrendingDataSource] = createGlobalState(Services.Settings.getTrendingDataSource, (x) =>
    Messages.events.currentTrendingDataProviderSettings.on(x),
)

export const [useAncientPostsCompatibilityMode] = createGlobalState(
    Services.Settings.getAncientPostsCompatibiltyMode,
    (x) => Messages.events.disableOpenNewTabInBackgroundSettings.on(x),
)
