import { unreachable } from '@dimensiondev/kit'
import { createGlobalSettings, createInternalSettings } from '../../settings/createSettings'
import { i18n } from '../../../shared-ui/locales_legacy'
import { PLUGIN_ID, SLIPPAGE_DEFAULT } from './constants'
import type { ZrxTradePool } from './types'
import { DataProvider, TradeProvider } from '@masknet/public-api'

/**
 * The slippage tolerance of trader
 */
export const currentSlippageSettings = createGlobalSettings<number>(
    `${PLUGIN_ID}+slippageTolerance`,
    SLIPPAGE_DEFAULT,
    {
        primary: () => '',
    },
)

/**
 * Single Hop
 */
export const currentSingleHopOnlySettings = createGlobalSettings<boolean>(`${PLUGIN_ID}+singleHopOnly`, false, {
    primary: () => '',
})

/**
 * The default data provider
 */
export const currentDataProviderSettings = createGlobalSettings<DataProvider>(
    `${PLUGIN_ID}+dataProvider`,
    DataProvider.COIN_GECKO,
    {
        primary: () => i18n.t('plugin_trader_settings_data_source_primary'),
        secondary: () => i18n.t('plugin_trader_settings_data_source_secondary'),
    },
)

// #region trade provider general settings
export interface TradeProviderSettings {
    pools: ZrxTradePool[]
}

const uniswapV2Settings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+uniswap+v2`, '')
const uniswapV3Settings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+uniswap+v3`, '')
const zrxSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+zrx`, '')
const sushiswapSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+sushiswap`, '')
const sashimiswapSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+sashimiswap`, '')
const quickswapSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+quickswap`, '')
const pancakeswapSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+pancakeswap`, '')
const balancerSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+balancer`, '')
const dodoSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+dodo`, '')
const oneInchSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+1inch`, '')
const bancorSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+bancor`, '')
const traderjoeSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+traderjoe`, '')
const pangolinSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+pangolin`, '')
const openoceanSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+openocean`, '')
const trisolarisSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+trisolaris`, '')
const wannaswapSettings = createInternalSettings<string>(`${PLUGIN_ID}+tradeProvider+wannaswap`, '')

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
            return quickswapSettings
        case TradeProvider.PANCAKESWAP:
            return pancakeswapSettings
        case TradeProvider.BALANCER:
            return balancerSettings
        case TradeProvider.DODO:
            return dodoSettings
        case TradeProvider.ONE_INCH:
            return oneInchSettings
        case TradeProvider.BANCOR:
            return bancorSettings
        case TradeProvider.TRADERJOE:
            return traderjoeSettings
        case TradeProvider.OPENOCEAN:
            return openoceanSettings
        case TradeProvider.PANGOLIN:
            return pangolinSettings
        case TradeProvider.TRISOLARIS:
            return trisolarisSettings
        case TradeProvider.WANNASWAP:
            return wannaswapSettings
        default:
            unreachable(tradeProvider)
    }
}
// #endregion

// #region data provider general settings
const coinGeckoSettings = createInternalSettings(`${PLUGIN_ID}+currentCoinGeckoSettings`, '')
const coinMarketCapSettings = createInternalSettings(`${PLUGIN_ID}+currentCoinMarketCapSettings`, '')
const coinUniswapSettings = createInternalSettings(`${PLUGIN_ID}+currentCoinUniswapSettings`, '')

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
// #endregion

// #region the user preferred coin id
const coinGeckoPreferredCoinId = createInternalSettings<string>(`${PLUGIN_ID}+currentCoinGeckoPreferredCoinId`, '{}')
const coinMarketCapPreferredCoinId = createInternalSettings<string>(
    `${PLUGIN_ID}+currentCoinMarketCapPreferredCoinId`,
    '{}',
)
const coinUniswapPreferredCoinId = createInternalSettings<string>(
    `${PLUGIN_ID}+currentCoinUniswapPreferredCoinId`,
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
// #endregion

/**
 * The approved tokens from uniswap
 */
export const approvedTokensFromUniSwap = createInternalSettings<string>(`${PLUGIN_ID}+approvedTokens`, '[]')
