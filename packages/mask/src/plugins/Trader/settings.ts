import { unreachable } from '@masknet/kit'
import { createGlobalSettings, createNSSettingsJSON } from '../../../shared/legacy-settings/createSettings.js'
import { PLUGIN_ID, SLIPPAGE_DEFAULT } from './constants/index.js'
import { DataProvider } from '@masknet/public-api'
import { EMPTY_LIST, EMPTY_OBJECT } from '@masknet/shared-base'

/**
 * The slippage tolerance of trader
 */
export const currentSlippageSettings = createGlobalSettings(`${PLUGIN_ID}+slippageTolerance`, SLIPPAGE_DEFAULT)

/**
 * Single Hop
 */
export const currentSingleHopOnlySettings = createGlobalSettings(`${PLUGIN_ID}+singleHopOnly`, false)

const defaultValue: Record<string, string> = EMPTY_OBJECT
// #region the user preferred coin id
const coinGeckoPreferredCoinId = createNSSettingsJSON(PLUGIN_ID, 'currentCoinGeckoPreferredCoinId', defaultValue)
const coinMarketCapPreferredCoinId = createNSSettingsJSON(
    PLUGIN_ID,
    'currentCoinMarketCapPreferredCoinId',
    defaultValue,
)
const coinUniswapPreferredCoinId = createNSSettingsJSON(PLUGIN_ID, 'currentCoinUniswapPreferredCoinId', defaultValue)
const coinNftScanPreferredCoinId = createNSSettingsJSON(PLUGIN_ID, 'coinNftScanPreferredCoinId', defaultValue)

export function getCurrentPreferredCoinIdSettings(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return coinGeckoPreferredCoinId
        case DataProvider.CoinMarketCap:
            return coinMarketCapPreferredCoinId
        case DataProvider.UniswapInfo:
            return coinUniswapPreferredCoinId
        case DataProvider.NFTScan:
            return coinNftScanPreferredCoinId
        default:
            unreachable(dataProvider)
    }
}
// #endregion

/**
 * The approved tokens from uniswap
 */
export const approvedTokensFromUniswap = createNSSettingsJSON<string[]>(PLUGIN_ID, 'approvedTokens', EMPTY_LIST)
