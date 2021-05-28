import type { Trade } from '@uniswap/sdk'
import { unreachable } from '@dimensiondev/maskbook-shared'
import { SwapQuoteResponse, SwapResponse, TradeComputed, TradeProvider } from '../types'
import { useTradeCallback as useNativeTokenWrapperCallback } from './native/useTradeCallback'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useTradeCallback as useBalancerCallback } from './balancer/useTradeCallback'
import { useRouterV2Contract as useUniswapRouterV2Contract } from '../contracts/uniswap/useRouterV2Contract'
import { useRouterV2Contract as useSushiSwapRouterV2Contract } from '../contracts/sushiswap/useRouterV2Contract'
import { useRouterV2Contract as useSashimiSwapRouterV2Contract } from '../contracts/sashimiswap/useRouterV2Contract'
import { useExchangeProxyContract } from '../contracts/balancer/useExchangeProxyContract'
import type { NativeTokenWrapper } from './native/useTradeComputed'
import { isNativeTokenWrapper } from '../helpers'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    // create contract instances for uniswap and sushiswap
    const uniswapRouterV2Contract = useUniswapRouterV2Contract()
    const sushiswapRouterV2Contract = useSushiSwapRouterV2Contract()
    const sashimiswapRouterV2Contract = useSashimiSwapRouterV2Contract()
    const exchangeProxyContract = useExchangeProxyContract()

    // create trade callbacks
    const isNativeTokenWrapper_ = isNativeTokenWrapper(tradeComputed)
    const nativeTokenWrapper = useNativeTokenWrapperCallback(tradeComputed as TradeComputed<NativeTokenWrapper>)

    const uniswap = useUniswapCallback(
        provider === TradeProvider.UNISWAP && !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<Trade>) : null,
        uniswapRouterV2Contract,
    )
    const zrx = useZrxCallback(
        provider === TradeProvider.ZRX && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<SwapQuoteResponse>)
            : null,
    )
    const sushiswap = useUniswapCallback(
        provider === TradeProvider.SUSHISWAP && !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<Trade>) : null,
        sushiswapRouterV2Contract,
    )
    const sashimiswap = useUniswapCallback(
        provider === TradeProvider.SASHIMISWAP && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<Trade>)
            : null,
        sashimiswapRouterV2Contract,
    )
    const balancer = useBalancerCallback(
        provider === TradeProvider.BALANCER && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<SwapResponse>)
            : null,
        exchangeProxyContract,
    )

    // the trade is an ETH-WETH pair
    if (isNativeTokenWrapper_) return nativeTokenWrapper

    // handle trades by various provider
    switch (provider) {
        case TradeProvider.UNISWAP:
            return uniswap
        case TradeProvider.ZRX:
            return zrx
        case TradeProvider.SUSHISWAP:
            return sushiswap
        case TradeProvider.SASHIMISWAP:
            return sashimiswap
        case TradeProvider.BALANCER:
            return balancer
        default:
            unreachable(provider)
    }
}
