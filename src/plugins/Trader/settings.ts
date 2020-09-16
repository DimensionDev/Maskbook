import { createInternalSettings, createGlobalSettings } from '../../settings/createSettings'
import { Platform } from './types'
import { PLUGIN_IDENTIFIER } from './constants'
import { i18n } from '../../utils/i18n-next'

/**
 * The data source of the trending view
 */
export const currentTrendingViewPlatformSettings = createGlobalSettings<Platform>(
    `${PLUGIN_IDENTIFIER}+platform`,
    Platform.COIN_MARKET_CAP,
    {
        primary: () => i18n.t('plugin_trader_settings_platform_primary'),
        secondary: () => i18n.t('plugin_trader_settings_platform_secondary'),
    },
)

function createPluginInternalSettings<T extends browser.storage.StorageValue>(key: string, initial: T) {
    return createInternalSettings<T>(`${PLUGIN_IDENTIFIER}+${key}`, initial)
}

const coinGeckoSettings = createPluginInternalSettings('currentTrendingViewPlatformCoinGeckoSettings', '')
const coinMarketCapSettings = createPluginInternalSettings('currentTrendingViewPlatformCoinMarketCapSettings', '')

/**
 * The general settings of specific platform
 */
export function getCurrentTrendingViewSettings(platform: Platform) {
    return platform === Platform.COIN_GECKO ? coinGeckoSettings : coinMarketCapSettings
}
