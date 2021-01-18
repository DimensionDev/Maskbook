import type { Trade } from '@uniswap/sdk'
import { unreachable } from '../../../utils/utils'
import { SwapQuoteResponse, TradeComputed, TradeProvider } from '../types'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useTradeCallback as useSushiSwapCallback } from './sushiswap/useTradeCallback'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    const uniswap = useUniswapCallback(
        provider === TradeProvider.UNISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
    )
    const zrx = useZrxCallback(
        provider === TradeProvider.ZRX ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null,
    )
    const sushiswap = useSushiSwapCallback(
        provider === TradeProvider.SUSHISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
    )
    switch (provider) {
        case TradeProvider.UNISWAP:
            return uniswap
        case TradeProvider.ZRX:
            return zrx
        case TradeProvider.SUSHISWAP:
            return sushiswap
        default:
            unreachable(provider)
    }
}
