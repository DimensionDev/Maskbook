import { ZERO, FungibleTokenDetailed } from '@masknet/web3-shared'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { TradeType } from '@uniswap/sdk-core'
import { uniswapCurrencyAmountTo, uniswapPercentTo, uniswapPriceTo, uniswapTokenTo } from '../../helpers'
import { Trade, TradeComputed, TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { useTradeBreakdown } from './useTradeBreakdown'

export function useTradeComputed(
    trade: Trade | null,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
): TradeComputed<Trade> | null {
    const slippage = useSlippageTolerance()
    const breakdown = useTradeBreakdown(trade)

    if (!trade) return null

    return {
        strategy: trade.tradeType === TradeType.EXACT_INPUT ? TradeStrategy.ExactIn : TradeStrategy.ExactOut,
        inputToken,
        outputToken,
        inputAmount: uniswapCurrencyAmountTo(trade.inputAmount),
        outputAmount: uniswapCurrencyAmountTo(trade.outputAmount),
        // @ts-ignore
        executionPrice: uniswapPriceTo(trade.executionPrice),
        priceImpact: uniswapPercentTo(breakdown?.priceImpact ?? trade.priceImpact),
        path: trade instanceof V2Trade ? trade.route.path.map((x) => [uniswapTokenTo(x)]) : [],
        maximumSold: uniswapCurrencyAmountTo(trade.maximumAmountIn(slippage)),
        minimumReceived: uniswapCurrencyAmountTo(trade.minimumAmountOut(slippage)),
        fee: breakdown?.realizedLPFee ? uniswapCurrencyAmountTo(breakdown.realizedLPFee) : ZERO,
        trade_: trade,
    }
}
