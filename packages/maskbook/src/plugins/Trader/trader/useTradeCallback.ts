import { useContext } from 'react'
import type { Trade } from '@uniswap/v2-sdk'
import type { Currency, TradeType } from '@uniswap/sdk-core'
import { unreachable } from '@dimensiondev/kit'
import { SwapQuoteResponse, SwapResponse, TradeComputed, TradeProvider } from '../types'
import { useTradeCallback as useNativeTokenWrapperCallback } from './native/useTradeCallback'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useTradeCallback as useBalancerCallback } from './balancer/useTradeCallback'
import { useRouterV2Contract as useUniswapRouterV2Contract } from '../contracts/uniswap/useRouterV2Contract'
import { useRouterV2Contract as useSushiSwapRouterV2Contract } from '../contracts/sushiswap/useRouterV2Contract'
import { useRouterV2Contract as useSashimiSwapRouterV2Contract } from '../contracts/sashimiswap/useRouterV2Contract'
import { useRouterV2Contract as useQuickSwapRouterV2Contract } from '../contracts/quickswap/useRouterV2Contract'
import { useRouterV2Contract as usePancakeSwapRouterV2Contract } from '../contracts/pancakeswap/useRouterV2Contract'
import { useExchangeProxyContract } from '../contracts/balancer/useExchangeProxyContract'
import type { NativeTokenWrapper } from './native/useTradeComputed'
import { isNativeTokenWrapper } from '../helpers'
import { TradeContext } from './useTradeContext'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    const uniswapRouterV2Contract = useUniswapRouterV2Contract()
    const sushiswapRouterV2Contract = useSushiSwapRouterV2Contract()
    const sashimiswapRouterV2Contract = useSashimiSwapRouterV2Contract()
    const quickswapRouterV2Contract = useQuickSwapRouterV2Contract()
    const pancakeswapRouterV2Contract = usePancakeSwapRouterV2Contract()
    const exchangeProxyContract = useExchangeProxyContract()

    // trade conetxt
    const context = useContext(TradeContext)

    // create trade computed
    const isNativeTokenWrapper_ = isNativeTokenWrapper(tradeComputed)
    const tradeComputedForUniswapLike =
        context?.IS_UNISWAP_LIKE && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<Trade<Currency, Currency, TradeType>>)
            : null
    const tradeComputedForZRX = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null
    const tradeComputedForBalancer = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapResponse>) : null

    const uniswap = useUniswapCallback(tradeComputedForUniswapLike, uniswapRouterV2Contract)
    const sushiswap = useUniswapCallback(tradeComputedForUniswapLike, sushiswapRouterV2Contract)
    const sashimiswap = useUniswapCallback(tradeComputedForUniswapLike, sashimiswapRouterV2Contract)
    const quickswap = useUniswapCallback(tradeComputedForUniswapLike, quickswapRouterV2Contract)
    const pancakeswap = useUniswapCallback(tradeComputedForUniswapLike, pancakeswapRouterV2Contract)
    const balancer = useBalancerCallback(
        provider === TradeProvider.BALANCER ? tradeComputedForBalancer : null,
        exchangeProxyContract,
    )
    const zrx = useZrxCallback(provider === TradeProvider.ZRX ? tradeComputedForZRX : null)
    const nativeTokenWrapper = useNativeTokenWrapperCallback(tradeComputed as TradeComputed<NativeTokenWrapper>)

    // the trade is an ETH-WETH pair
    if (isNativeTokenWrapper_) return nativeTokenWrapper

    // handle trades by various provider
    switch (provider) {
        case TradeProvider.UNISWAP:
            return uniswap
        case TradeProvider.SUSHISWAP:
            return sushiswap
        case TradeProvider.SASHIMISWAP:
            return sashimiswap
        case TradeProvider.QUICKSWAP:
            return quickswap
        case TradeProvider.PANCAKESWAP:
            return pancakeswap
        case TradeProvider.ZRX:
            return zrx
        case TradeProvider.BALANCER:
            return balancer
        default:
            unreachable(provider)
    }
}
