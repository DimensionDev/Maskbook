import { createInternalSettings } from '../../settings/createSettings'
import { Platform } from './types'
import { PLUGIN_IDENTIFIER } from './constants'

function createPluginInternalSettings<T extends browser.storage.StorageValue>(key: string, initial: T) {
    return createInternalSettings<T>(`${PLUGIN_IDENTIFIER}+${key}`, initial)
}

export const currentTrendingViewPlatformSettings = createPluginInternalSettings(
    'currentTrendingViewPlatformSettings',
    String(Platform.COIN_GECKO),
)

const coinGeckoSettings = createPluginInternalSettings('currentTrendingViewPlatformCoinGeckoSettings', '')
const coinMarketCapSettings = createPluginInternalSettings('currentTrendingViewPlatformCoinMarketCapSettings', '')

export function getCurrentTrendingViewPlatformSettings(platform: Platform) {
    return platform === Platform.COIN_GECKO ? coinGeckoSettings : coinMarketCapSettings
}
