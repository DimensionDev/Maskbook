import { createInternalSettings, createGlobalSettings } from '../../settings/createSettings'
import { DataProvider, SwapProvider } from './types'
import { PLUGIN_IDENTIFIER } from './constants'
import { i18n } from '../../utils/i18n-next'

/**
 * The swap provider for trading
 */
export const currentSwapProviderSettings = createGlobalSettings<SwapProvider>(
    `${PLUGIN_IDENTIFIER}+swapProvider`,
    SwapProvider.UNISWAP,
    {
        primary: () => '',
    },
)

/**
 * The data source of the trending view
 */
export const currentDataProviderSettings = createGlobalSettings<DataProvider>(
    `${PLUGIN_IDENTIFIER}+dataProvider`,
    DataProvider.COIN_MARKET_CAP,
    {
        primary: () => i18n.t('plugin_trader_settings_data_source_primary'),
        secondary: () => i18n.t('plugin_trader_settings_data_source_secondary'),
    },
)

function createPluginInternalSettings<T extends browser.storage.StorageValue>(key: string, initial: T) {
    return createInternalSettings<T>(`${PLUGIN_IDENTIFIER}+${key}`, initial)
}

const coinGeckoSettings = createPluginInternalSettings('currentCoinGeckoSettings', '')
const coinMarketCapSettings = createPluginInternalSettings('currentCoinMarketCapSettings', '')

/**
 * The general settings of specific data source
 */
export function getCurrentDataProviderGeneralSettings(dataSource: DataProvider) {
    return dataSource === DataProvider.COIN_GECKO ? coinGeckoSettings : coinMarketCapSettings
}
