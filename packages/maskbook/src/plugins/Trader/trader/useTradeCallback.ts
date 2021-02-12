import type { Trade } from '@uniswap/sdk'
import { unreachable } from '../../../utils/utils'
import { SwapQuoteResponse, TradeComputed, TradeProvider } from '../types'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useRouterV2Contract as useUniswapRouterV2Contract } from '../contracts/uniswap/useRouterV2Contract'
import { useRouterV2Contract as useSushiSwapRouterV2Contract } from '../contracts/sushiswap/useRouterV2Contract'
import { useRouterV2Contract as useSashimiSwapRouterV2Contract } from '../contracts/sashimiswap/useRouterV2Contract'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    // create contract instances for uniswap and sushiswap
    const uniswapRouterV2Contract = useUniswapRouterV2Contract()
    const sushiswapRouterV2Contract = useSushiSwapRouterV2Contract()
    const sashimiswapRouterV2Contract = useSashimiSwapRouterV2Contract()

    // create trade callbacks
    const uniswap = useUniswapCallback(
        provider === TradeProvider.UNISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
        uniswapRouterV2Contract,
    )
    const zrx = useZrxCallback(
        provider === TradeProvider.ZRX ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null,
    )
    const sushiswap = useUniswapCallback(
        provider === TradeProvider.SUSHISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
        sushiswapRouterV2Contract,
    )
    const sashimiswap = useUniswapCallback(
        provider === TradeProvider.SASHIMISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
        sushiswapRouterV2Contract,
    )
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
            return zrx
        default:
            unreachable(provider)
    }
}
