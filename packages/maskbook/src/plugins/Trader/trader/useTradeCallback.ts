import { useContext } from 'react'
import type { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade as V3Trade } from '@uniswap/v3-sdk'
import type { Currency, TradeType } from '@uniswap/sdk-core'
import { unreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import type {
    SwapQuoteResponse,
    SwapResponse,
    SwapRouteSuccessResponse,
    SwapQuoteOneResponse,
    TradeComputed,
} from '../types'
import { useTradeCallback as useNativeTokenWrapperCallback } from './native/useTradeCallback'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useTradeCallback as useBalancerCallback } from './balancer/useTradeCallback'
import { useTradeCallback as useDODOCallback } from './dodo/useTradeCallback'
import { useTradeCallback as useONECallback } from './1inch/useTradeCallback'
import { useExchangeProxyContract } from '../contracts/balancer/useExchangeProxyContract'
import type { NativeTokenWrapper } from './native/useTradeComputed'
import { isNativeTokenWrapper } from '../helpers'
import { TradeContext } from './useTradeContext'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    // trade conetxt
    const context = useContext(TradeContext)

    // create trade computed
    const isNativeTokenWrapper_ = isNativeTokenWrapper(tradeComputed)
    const tradeComputedForUniswapV2Like =
        context?.IS_UNISWAP_V2_LIKE && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<V2Trade<Currency, Currency, TradeType>>)
            : null
    const tradeComputedForUniswapV3Like =
        context?.IS_UNISWAP_V3_LIKE && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<V3Trade<Currency, Currency, TradeType>>)
            : null
    const tradeComputedForZRX = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null
    const tradeComputedForBalancer = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapResponse>) : null
    const tradeComputedForDODO = !isNativeTokenWrapper_
        ? (tradeComputed as TradeComputed<SwapRouteSuccessResponse>)
        : null
    const tradeComputedForONE = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapQuoteOneResponse>) : null

    // uniswap like providers
    const uniswapV2Like = useUniswapCallback(tradeComputedForUniswapV2Like)
    const uniswapV3Like = useUniswapCallback(tradeComputedForUniswapV3Like)

    // balancer
    const exchangeProxyContract = useExchangeProxyContract()
    const balancer = useBalancerCallback(
        provider === TradeProvider.BALANCER ? tradeComputedForBalancer : null,
        exchangeProxyContract,
    )

    // other providers
    const zrx = useZrxCallback(provider === TradeProvider.ZRX ? tradeComputedForZRX : null)
    const dodo = useDODOCallback(provider === TradeProvider.DODO ? tradeComputedForDODO : null)
    const one = useONECallback(provider === TradeProvider.ONE_INCH ? tradeComputedForONE : null)

    // the trade is an ETH-WETH pair
    const nativeTokenWrapper = useNativeTokenWrapperCallback(tradeComputed as TradeComputed<NativeTokenWrapper>)
    if (isNativeTokenWrapper_) return nativeTokenWrapper

    // handle trades by various provider
    switch (provider) {
        case TradeProvider.UNISWAP_V2:
            return uniswapV2Like
        case TradeProvider.UNISWAP_V3:
            return uniswapV3Like
        case TradeProvider.SUSHISWAP:
            return uniswapV2Like
        case TradeProvider.SASHIMISWAP:
            return uniswapV2Like
        case TradeProvider.QUICKSWAP:
            return uniswapV2Like
        case TradeProvider.PANCAKESWAP:
            return uniswapV2Like
        case TradeProvider.ZRX:
            return zrx
        case TradeProvider.BALANCER:
            return balancer
        case TradeProvider.DODO:
            return dodo
        case TradeProvider.ONE_INCH:
            return one
        default:
            unreachable(provider)
    }
}
