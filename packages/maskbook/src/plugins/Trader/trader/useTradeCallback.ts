import type { Trade } from '@uniswap/sdk'
import { unreachable } from '../../../utils/utils'
import { SwapQuoteResponse, TradeComputed, TradeProvider } from '../types'
import { useTradeCallback as useZrxSwapCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapSwapCallback } from './uniswap/useTradeCallback'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    const uniswap = useUniswapSwapCallback(
        provider === TradeProvider.UNISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
    )
    const zrx = useZrxSwapCallback(
        provider === TradeProvider.ZRX ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null,
    )
    switch (provider) {
        case TradeProvider.UNISWAP:
            return uniswap
        case TradeProvider.ZRX:
            return zrx
        default:
            unreachable(provider)
    }
}
