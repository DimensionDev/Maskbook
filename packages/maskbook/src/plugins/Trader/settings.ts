import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import stringify from 'json-stable-stringify'
import { createGlobalSettings, createInternalSettings } from '../../settings/createSettings'
import { i18n } from '../../utils/i18n-next'
import { PLUGIN_IDENTIFIER, SLIPPAGE_DEFAULT } from './constants'
import { ZrxTradePool } from './types'
import { DataProvider, TradeProvider } from '@masknet/public-api'

/**
 * The slippage tolerance of trader
 */
export const currentSlippageSettings = createGlobalSettings<number>(
    `${PLUGIN_IDENTIFIER}+slippageTolerance`,
    SLIPPAGE_DEFAULT,
    {
        primary: () => '',
    },
)

/**
 * Single Hop
 */
export const currentSingleHopOnlySettings = createGlobalSettings<boolean>(`${PLUGIN_IDENTIFIER}+singleHopOnly`, false, {
    primary: () => '',
})

/**
 * The default data provider
 */
export const currentDataProviderSettings = createGlobalSettings<DataProvider>(
    `${PLUGIN_IDENTIFIER}+dataProvider`,
    DataProvider.COIN_GECKO,
    {
        primary: () => i18n.t('plugin_trader_settings_data_source_primary'),
        secondary: () => i18n.t('plugin_trader_settings_data_source_secondary'),
    },
)

/**
 * The default trader provider
 */
export const currentTradeProviderSettings = createGlobalSettings<TradeProvider>(
    `${PLUGIN_IDENTIFIER}+tradeProvider`,
    TradeProvider.UNISWAP_V2,
    {
        primary: () => i18n.t('plugin_trader_settings_trade_provider_primary'),
        secondary: () => i18n.t('plugin_trader_settings_trade_provider_secondary'),
    },
)

export const ethereumNetworkTradeProviderSettings = createGlobalSettings<TradeProvider>(
    `${PLUGIN_IDENTIFIER}+ethereum+tradeProvider`,
    TradeProvider.UNISWAP_V2,
    { primary: () => '' },
)

export const polygonNetworkTradeProviderSettings = createGlobalSettings<TradeProvider>(
    `${PLUGIN_IDENTIFIER}+polygon+tradeProvider`,
    TradeProvider.QUICKSWAP,
    { primary: () => '' },
)

export const binanceNetworkTradeProviderSettings = createGlobalSettings<TradeProvider>(
    `${PLUGIN_IDENTIFIER}+binance+tradeProvider`,
    TradeProvider.PANCAKESWAP,
    { primary: () => '' },
)

export const arbitrumNetworkTradeProviderSettings = createGlobalSettings<TradeProvider>(
    `${PLUGIN_IDENTIFIER}+arbitrum+tradeProvider`,
    TradeProvider.UNISWAP_V3,
    { primary: () => '' },
)

//#region trade provider general settings
export interface TradeProviderSettings {
    pools: ZrxTradePool[]
}

const uniswapV2Settings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+uniswap+v2`, '')
const uniswapV3Settings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+uniswap+v3`, '')
const zrxSettings = createInternalSettings<string>(
    `${PLUGIN_IDENTIFIER}+tradeProvider+zrx`,
    stringify({
        pools: getEnumAsArray(ZrxTradePool).map((x) => x.value),
    }),
)
const sushiswapSettings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+sushiswap`, '')
const sashimiswapSettings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+sashimiswap`, '')
const qucikswapSettings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+quickswap`, '')
const pancakeswapSettings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+pancakeswap`, '')
const balancerSettings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+balancer`, '')
const dodoSettings = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+tradeProvider+dodo`, '')

/**
 * The general settings of specific tarde provider
 */
export function getCurrentTradeProviderGeneralSettings(tradeProvider: TradeProvider) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP_V2:
            return uniswapV2Settings
        case TradeProvider.UNISWAP_V3:
            return uniswapV3Settings
        case TradeProvider.ZRX:
            return zrxSettings
        case TradeProvider.SUSHISWAP:
            return sushiswapSettings
        case TradeProvider.SASHIMISWAP:
            return sashimiswapSettings
        case TradeProvider.QUICKSWAP:
            return qucikswapSettings
        case TradeProvider.PANCAKESWAP:
            return pancakeswapSettings
        case TradeProvider.BALANCER:
            return balancerSettings
        case TradeProvider.DODO:
            return dodoSettings
        default:
            unreachable(tradeProvider)
    }
}
//#endregion

//#region data provider general settings
const coinGeckoSettings = createInternalSettings(`${PLUGIN_IDENTIFIER}+currentCoinGeckoSettings`, '')
const coinMarketCapSettings = createInternalSettings(`${PLUGIN_IDENTIFIER}+currentCoinMarketCapSettings`, '')
const coinUniswapSettings = createInternalSettings(`${PLUGIN_IDENTIFIER}+currentCoinUniswapSettings`, '')

/**
 * The general settings of specific data provider
 */
export function getCurrentDataProviderGeneralSettings(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return coinGeckoSettings
        case DataProvider.COIN_MARKET_CAP:
            return coinMarketCapSettings
        case DataProvider.UNISWAP_INFO:
            return coinUniswapSettings
        default:
            unreachable(dataProvider)
    }
}
//#endregion

//#region the user preferred coin id
const coinGeckoPreferredCoinId = createInternalSettings<string>(
    `${PLUGIN_IDENTIFIER}+currentCoinGeckoPreferredCoinId`,
    '{}',
)
const coinMarketCapPreferredCoinId = createInternalSettings<string>(
    `${PLUGIN_IDENTIFIER}+currentCoinMarketCapPreferredCoinId`,
    '{}',
)
const coinUniswapPreferredCoinId = createInternalSettings<string>(
    `${PLUGIN_IDENTIFIER}+currentCoinUniswapPreferredCoinId`,
    '{}',
)

export function getCurrentPreferredCoinIdSettings(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return coinGeckoPreferredCoinId
        case DataProvider.COIN_MARKET_CAP:
            return coinMarketCapPreferredCoinId
        case DataProvider.UNISWAP_INFO:
            return coinUniswapPreferredCoinId
        default:
            unreachable(dataProvider)
    }
}
//#endregion

/**
 * The approved tokens from uniswap
 */
export const approvedTokensFromUniSwap = createInternalSettings<string>(`${PLUGIN_IDENTIFIER}+approvedTokens`, '[]')
