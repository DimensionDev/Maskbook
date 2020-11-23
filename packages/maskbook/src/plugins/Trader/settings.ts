import { createInternalSettings, createGlobalSettings } from '../../settings/createSettings'
import { DataProvider, TradeProvider } from './types'
import { DEFAULT_SLIPPAGE_TOLERANCE, PLUGIN_IDENTIFIER } from './constants'
import { i18n } from '../../utils/i18n-next'

/**
 * The slippage tolerance of trader
 */
export const currentSlippageTolerance = createGlobalSettings<number>(
    `${PLUGIN_IDENTIFIER}+slippageTolerance`,
    DEFAULT_SLIPPAGE_TOLERANCE,
    {
        primary: () => '',
    },
)

/**
 * The default trader provider
 */
export const currentTradeProviderSettings = createGlobalSettings<TradeProvider>(
    `${PLUGIN_IDENTIFIER}+tradeProvider`,
    TradeProvider.UNISWAP,
    {
        primary: () => '',
    },
)

/**
 * The default data provider
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
 * The general settings of specific data provider
 */
export function getCurrentDataProviderGeneralSettings(dataSource: DataProvider) {
    return dataSource === DataProvider.COIN_GECKO ? coinGeckoSettings : coinMarketCapSettings
}
