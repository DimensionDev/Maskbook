import { unreachable } from '@dimensiondev/kit'
import { createGlobalSettings, createInternalSettings } from '../../../shared/legacy-settings/createSettings.js'
import { PLUGIN_ID, SLIPPAGE_DEFAULT } from './constants/index.js'
import type { ZrxTradePool } from './types/index.js'
import { DataProvider } from '@masknet/public-api'

/**
 * The slippage tolerance of trader
 */
export const currentSlippageSettings = createGlobalSettings(`${PLUGIN_ID}+slippageTolerance`, SLIPPAGE_DEFAULT)

/**
 * Single Hop
 */
export const currentSingleHopOnlySettings = createGlobalSettings(`${PLUGIN_ID}+singleHopOnly`, false)

// #region trade provider general settings
export interface TradeProviderSettings {
    pools: ZrxTradePool[]
}

// #region the user preferred coin id
const coinGeckoPreferredCoinId = createInternalSettings(`${PLUGIN_ID}+currentCoinGeckoPreferredCoinId`, '{}')
const coinMarketCapPreferredCoinId = createInternalSettings(`${PLUGIN_ID}+currentCoinMarketCapPreferredCoinId`, '{}')
const coinUniswapPreferredCoinId = createInternalSettings(`${PLUGIN_ID}+currentCoinUniswapPreferredCoinId`, '{}')
const coinNftScanPreferredCoinId = createInternalSettings(`${PLUGIN_ID}+coinNftScanPreferredCoinId`, '{}')

export function getCurrentPreferredCoinIdSettings(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return coinGeckoPreferredCoinId
        case DataProvider.COIN_MARKET_CAP:
            return coinMarketCapPreferredCoinId
        case DataProvider.UNISWAP_INFO:
            return coinUniswapPreferredCoinId
        case DataProvider.NFTSCAN:
            return coinNftScanPreferredCoinId
        default:
            unreachable(dataProvider)
    }
}
// #endregion

/**
 * The approved tokens from uniswap
 */
export const approvedTokensFromUniswap = createInternalSettings(`${PLUGIN_ID}+approvedTokens`, '[]')
