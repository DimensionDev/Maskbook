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
import { NetworkType } from '@masknet/web3-shared'
import urlcat from 'urlcat'

export function resolveCurrencyName(currency: Currency) {
    return [
        currency.name,
        currency.symbol ? `"${currency.symbol}"` : '',
        currency.description ? `(${currency.description})` : '',
    ].join(' ')
}

export function resolveDataProviderName(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return 'CoinGecko'
        case DataProvider.COIN_MARKET_CAP:
            return 'CoinMarketCap'
        case DataProvider.UNISWAP_INFO:
            return 'Uniswap Info'
        default:
            unreachable(dataProvider)
    }
}

export function resolveDataProviderLink(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return 'https://www.coingecko.com/'
        case DataProvider.COIN_MARKET_CAP:
            return 'https://coinmarketcap.com/'
        case DataProvider.UNISWAP_INFO:
            return 'https://info.uniswap.org/'
        default:
            unreachable(dataProvider)
    }
}

export function resolveTradeProviderName(tradeProvider: TradeProvider) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP_V2:
            return 'Uniswap V2'
        case TradeProvider.UNISWAP_V3:
            return 'Uniswap V3'
        case TradeProvider.ZRX:
            return '0x'
        case TradeProvider.SUSHISWAP:
            return 'SushiSwap'
        case TradeProvider.SASHIMISWAP:
            return 'SashimiSwap'
        case TradeProvider.BALANCER:
            return 'Balancer'
        case TradeProvider.QUICKSWAP:
            return 'QuickSwap'
        case TradeProvider.PANCAKESWAP:
            return 'PancakeSwap'
        case TradeProvider.DODO:
            return 'DODO'
        default:
            unreachable(tradeProvider)
    }
}

export function resolveTradeProviderLink(tradeProvider: TradeProvider) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP_V2:
            return 'https://uniswap.org/'
        case TradeProvider.UNISWAP_V3:
            return 'https://uniswap.org/'
        case TradeProvider.ZRX:
            return 'https://0x.org/'
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
                    return ''
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
    return
}

export function resolveUniswapWarningLevelColor(warningLevel?: WarningLevel) {
    const COLOR_MAP: Record<WarningLevel, string> = {
        [WarningLevel.LOW]: 'inherit',
        [WarningLevel.MEDIUM]: '#f3841e',
        [WarningLevel.HIGH]: '#f3841e',
        [WarningLevel.CONFIRMATION_REQUIRED]: '#ff6871',
        [WarningLevel.BLOCKED]: '#ff6871',
    }
    return warningLevel ? COLOR_MAP[warningLevel] : '#27ae60'
}

export function resolveZrxTradePoolName(swapSource: ZrxTradePool) {
    const SWAP_SOURCE_NAME_MAP: Record<ZrxTradePool, string> = {
        [ZrxTradePool.ZRX]: 'ZRX',
        [ZrxTradePool.Uniswap]: 'Uniswap',
        [ZrxTradePool.UniswapV2]: 'Uniswap V2',
        [ZrxTradePool.Eth2Dai]: 'Eth2Dai',
        [ZrxTradePool.Kyber]: 'Kyber',
        [ZrxTradePool.Curve]: 'Curve',
        [ZrxTradePool.Balancer]: 'Balancer',
        [ZrxTradePool.BalancerV2]: 'BalancerV2',
        [ZrxTradePool.Bancor]: 'Bancor',
        [ZrxTradePool.MStable]: 'mStable',
        [ZrxTradePool.Mooniswap]: 'Mooniswap',
        [ZrxTradePool.Swerve]: 'Swerve',
        [ZrxTradePool.SnowSwap]: 'SnowSwap',
        [ZrxTradePool.SushiSwap]: 'SushiSwap',
        [ZrxTradePool.Shell]: 'Shell',
        [ZrxTradePool.MultiHop]: 'MultiHop',
        [ZrxTradePool.Dodo]: 'DODO',
        [ZrxTradePool.DodoV2]: 'DODO V2',
        [ZrxTradePool.Cream]: 'CREAM',
        [ZrxTradePool.LiquidityProvider]: 'LiquidityProvider',
        [ZrxTradePool.CryptoCom]: 'CryptoCom',
        [ZrxTradePool.Linkswap]: 'Linkswap',
        [ZrxTradePool.Lido]: 'Lido',
        [ZrxTradePool.MakerPsm]: 'MakerPsm',
        [ZrxTradePool.KyberDMM]: 'KyberDMM',
        [ZrxTradePool.Smoothy]: 'Smoothy',
        [ZrxTradePool.Saddle]: 'Saddle',
        [ZrxTradePool.xSigma]: 'xSigma',
        [ZrxTradePool.UniswapV3]: 'Uniswap V3',
        [ZrxTradePool.CurveV2]: 'Curve_V2',

        // unseen in the response
        [ZrxTradePool.Native]: 'Native',
        [ZrxTradePool.Mesh]: 'Mesh',
        [ZrxTradePool.MultiBridge]: 'MultiBridge',
    }
    return SWAP_SOURCE_NAME_MAP[swapSource] ?? 'Unknwn'
}
