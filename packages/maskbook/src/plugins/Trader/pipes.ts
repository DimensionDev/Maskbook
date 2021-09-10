import type BigNumber from 'bignumber.js'
import { Currency, WarningLevel, ZrxTradePool } from './types'
import { DataProvider, TradeProvider } from '@masknet/public-api'
import { safeUnreachable, unreachable } from '@dimensiondev/kit'
import {
    BIPS_BASE,
    networkNames,
    PRICE_IMPACT_HIGH,
    PRICE_IMPACT_LOW,
    PRICE_IMPACT_MEDIUM,
    PRICE_IMPACT_NON_EXPERT_BLOCKED,
    PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
} from './constants'
import { createLookupTableResolver, NetworkType } from '@masknet/web3-shared'
import urlcat from 'urlcat'

export function resolveCurrencyName(currency: Currency) {
    return [
        currency.name,
        currency.symbol ? `"${currency.symbol}"` : '',
        currency.description ? `(${currency.description})` : '',
    ].join(' ')
}

export const resolveDataProviderName = createLookupTableResolver<DataProvider, string>(
    {
        [DataProvider.COIN_GECKO]: 'CoinGecko',
        [DataProvider.COIN_MARKET_CAP]: 'CoinMarketCap',
        [DataProvider.UNISWAP_INFO]: 'Uniswap Info',
    },
    (dataProvider) => {
        throw new Error(`Unknown data provider: ${dataProvider}`)
    },
)

export const resolveDataProviderLink = createLookupTableResolver<DataProvider, string>(
    {
        [DataProvider.COIN_GECKO]: 'https://www.coingecko.com/',
        [DataProvider.COIN_MARKET_CAP]: 'https://coinmarketcap.com/',
        [DataProvider.UNISWAP_INFO]: 'https://info.uniswap.org/',
    },
    (dataProvider) => {
        throw new Error(`Unknown data provider: ${dataProvider}`)
    },
)

export const resolveTradeProviderName = createLookupTableResolver<TradeProvider, string>(
    {
        [TradeProvider.UNISWAP_V2]: 'Uniswap V2',
        [TradeProvider.UNISWAP_V3]: 'Uniswap V3',
        [TradeProvider.ZRX]: '0x',
        [TradeProvider.SUSHISWAP]: 'SushiSwap',
        [TradeProvider.SASHIMISWAP]: 'SashimiSwap',
        [TradeProvider.BALANCER]: 'Balancer',
        [TradeProvider.QUICKSWAP]: 'QuickSwap',
        [TradeProvider.PANCAKESWAP]: 'PancakeSwap',
        [TradeProvider.DODO]: 'DODO',
    },
    (tradeProvider) => {
        throw new Error(`Unknown provider type: ${tradeProvider}`)
    },
)

export function resolveTradeProviderLink(tradeProvider: TradeProvider, networkType: NetworkType) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP_V2:
            return 'https://uniswap.org/'
        case TradeProvider.UNISWAP_V3:
            return 'https://uniswap.org/'
        case TradeProvider.ZRX:
            switch (networkType) {
                case NetworkType.Ethereum:
                    return 'https://api.0x.org/'
                case NetworkType.Binance:
                    return 'https://bsc.api.0x.org/'
                case NetworkType.Polygon:
                    return 'https://polygon.api.0x.org/'
                case NetworkType.Arbitrum:
                    return 'https://aribitrum.api.0x.org/'
                case NetworkType.xDai:
                    return 'https://xdai.api.0x.org/'
                default:
                    safeUnreachable(networkType)
                    return ''
            }
        case TradeProvider.SUSHISWAP:
            return 'https://sushiswapclassic.org/'
        case TradeProvider.SASHIMISWAP:
            return 'https://sashimi.cool/'
        case TradeProvider.BALANCER:
            return 'https://balancer.exchange/'
        case TradeProvider.QUICKSWAP:
            return 'https://quickswap.exchange/'
        case TradeProvider.PANCAKESWAP:
            return 'https://exchange.pancakeswap.finance/#/swap'
        case TradeProvider.DODO:
            return 'https://app.dodoex.io'
        default:
            unreachable(tradeProvider)
    }
}

export function resolveTradePairLink(tradeProvider: TradeProvider, address: string, networkType: NetworkType) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP_V2:
            return `https://v2.info.uniswap.org/pair/${address}`
        case TradeProvider.UNISWAP_V3:
            return `https://info.uniswap.org/pair/${address}`
        case TradeProvider.ZRX:
            return ''
        case TradeProvider.DODO: {
            if (!networkNames[networkType]) {
                console.error('Unsupported network: ', networkType)
                return ''
            }
            return urlcat('https://app.dodoex.io/exchange/:address', {
                address,
                network: networkNames[networkType],
                forced: true,
            })
        }
        case TradeProvider.SUSHISWAP:
            switch (networkType) {
                case NetworkType.Ethereum:
                    return `https://analytics.sushi.com/pairs/${address}`
                case NetworkType.Binance:
                    return `https://analytics-bsc.sushi.com/pairs/${address}`
                case NetworkType.Polygon:
                    return `https://analytics-polygon.sushi.com/pairs/${address}`
                case NetworkType.Arbitrum:
                    return `https://analytics-aribtrum.sushi.com/pairs/${address}`
                case NetworkType.xDai:
                    return `https://analytics-xdai.sushi.com/pairs/${address}`
                default:
                    safeUnreachable(networkType)
                    return ''
            }
        case TradeProvider.SASHIMISWAP:
            return `https://info.sashimi.cool/pair/${address}`
        case TradeProvider.BALANCER:
            return `https://pools.balancer.exchange/#/pool/${address}/`
        case TradeProvider.QUICKSWAP:
            return `https://info.quickswap.exchange/pair/${address}`
        case TradeProvider.PANCAKESWAP:
            return `https://pancakeswap.info/pool/${address}`
        default:
            unreachable(tradeProvider)
    }
}

export function resolveDaysName(days: number) {
    if (days === 0) return 'MAX'
    if (days >= 365) return `${Math.floor(days / 365)}y`
    if (days >= 30) return `${Math.floor(days / 30)}m`
    if (days >= 7) return `${Math.floor(days / 7)}w`
    return `${days}d`
}

export function resolveUniswapWarningLevel(priceImpact: BigNumber) {
    const priceImpact_ = priceImpact.multipliedBy(BIPS_BASE)
    if (priceImpact_.isGreaterThan(PRICE_IMPACT_NON_EXPERT_BLOCKED)) return WarningLevel.BLOCKED
    if (priceImpact_.isGreaterThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) return WarningLevel.CONFIRMATION_REQUIRED
    if (priceImpact_.isGreaterThan(PRICE_IMPACT_HIGH)) return WarningLevel.HIGH
    if (priceImpact_.isGreaterThan(PRICE_IMPACT_MEDIUM)) return WarningLevel.MEDIUM
    if (priceImpact_.isGreaterThan(PRICE_IMPACT_LOW)) return WarningLevel.LOW
    return WarningLevel.LOW
}

export const resolveUniswapWarningLevelColor = createLookupTableResolver<WarningLevel, string>(
    {
        [WarningLevel.LOW]: 'inherit',
        [WarningLevel.MEDIUM]: '#f3841e',
        [WarningLevel.HIGH]: '#f3841e',
        [WarningLevel.CONFIRMATION_REQUIRED]: '#ff6871',
        [WarningLevel.BLOCKED]: '#ff6871',
    },
    '#27ae60',
)

export const resolveZrxTradePoolName = createLookupTableResolver<ZrxTradePool, string>(
    {
        [ZrxTradePool.ZRX]: '0x',
        [ZrxTradePool.ACryptoS]: 'ACryptoS',
        [ZrxTradePool.ApeSwap]: 'ApeSwap',
        [ZrxTradePool.BakerySwap]: 'BakerySwap',
        [ZrxTradePool.Balancer]: 'Balancer',
        [ZrxTradePool.BalancerV2]: 'Balancer V2',
        [ZrxTradePool.Bancor]: 'Bancor',
        [ZrxTradePool.Belt]: 'Belt',
        [ZrxTradePool.CafeSwap]: 'CafeSwap',
        [ZrxTradePool.CheeseSwap]: 'CheeseSwap',
        [ZrxTradePool.ComethSwap]: 'ComethSwap',
        [ZrxTradePool.Component]: 'Component',
        [ZrxTradePool.Cream]: 'CREAM',
        [ZrxTradePool.CryptoCom]: 'CryptoCom',
        [ZrxTradePool.Curve]: 'Curve',
        [ZrxTradePool.CurveV2]: 'Curve V2',
        [ZrxTradePool.Dfyn]: 'Dfyn',
        [ZrxTradePool.Dodo]: 'DODO',
        [ZrxTradePool.DodoV2]: 'DODO V2',
        [ZrxTradePool.Ellipsis]: 'Ellipsis',
        [ZrxTradePool.Eth2Dai]: 'Eth2Dai',
        [ZrxTradePool.FirebirdOneSwap]: 'FirebirdOneSwap',
        [ZrxTradePool.IronSwap]: 'IronSwap',
        [ZrxTradePool.JetSwap]: 'JetSwap',
        [ZrxTradePool.JulSwap]: 'JulSwap',
        [ZrxTradePool.Kyber]: 'Kyber',
        [ZrxTradePool.KyberDMM]: 'KyberDMM',
        [ZrxTradePool.Lido]: 'Lido',
        [ZrxTradePool.Linkswap]: 'Linkswap',
        [ZrxTradePool.LiquidityProvider]: 'LiquidityProvider',
        [ZrxTradePool.MStable]: 'mStable',
        [ZrxTradePool.MakerPsm]: 'MakerPsm',
        [ZrxTradePool.Mesh]: 'Mesh',
        [ZrxTradePool.Mooniswap]: 'Mooniswap',
        [ZrxTradePool.MultiBridge]: 'MultiBridge',
        [ZrxTradePool.MultiHop]: 'MultiHop',
        [ZrxTradePool.Native]: 'Native',
        [ZrxTradePool.Nerve]: 'Nerve',
        [ZrxTradePool.Oasis]: 'Oasis',
        [ZrxTradePool.PancakeSwap]: 'PancakeSwap',
        [ZrxTradePool.PancakeSwapV2]: 'PancakeSwap V2',
        [ZrxTradePool.QuickSwap]: 'QuickSwap',
        [ZrxTradePool.Saddle]: 'Saddle',
        [ZrxTradePool.Shell]: 'Shell',
        [ZrxTradePool.Smoothy]: 'Smoothy',
        [ZrxTradePool.SnowSwap]: 'SnowSwap',
        [ZrxTradePool.SushiSwap]: 'SushiSwap',
        [ZrxTradePool.Swerve]: 'Swerve',
        [ZrxTradePool.Uniswap]: 'Uniswap',
        [ZrxTradePool.UniswapV2]: 'Uniswap V2',
        [ZrxTradePool.UniswapV3]: 'Uniswap V3',
        [ZrxTradePool.WaultSwap]: 'WaultSwap',
        [ZrxTradePool.xSigma]: 'xSigma',
    },
    'Unknown',
)
