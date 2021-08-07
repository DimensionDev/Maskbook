import { ZERO, FungibleTokenDetailed } from '@masknet/web3-shared'
import type { Trade } from '@uniswap/v3-sdk'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { uniswapCurrencyAmountTo, uniswapPercentTo, uniswapPriceTo } from '../../helpers'
import { TradeComputed, TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { useTradeBreakdown } from './useTradeBreakdown'

export function useV3TradeComputed(
    trade: Trade<Currency, Currency, TradeType> | null,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
): TradeComputed<Trade<Currency, Currency, TradeType>> | null {
    const slippage = useSlippageTolerance()
    const breakdown = useTradeBreakdown(trade)

    if (!trade) return null

    return {
        strategy: trade.tradeType === TradeType.EXACT_INPUT ? TradeStrategy.ExactIn : TradeStrategy.ExactOut,
        inputToken,
        outputToken,
        inputAmount: uniswapCurrencyAmountTo(trade.inputAmount),
        outputAmount: uniswapCurrencyAmountTo(trade.outputAmount),
        executionPrice: uniswapPriceTo(trade.executionPrice),
        priceImpact: uniswapPercentTo(breakdown?.priceImpact ?? trade.priceImpact),
        maximumSold: uniswapCurrencyAmountTo(trade.maximumAmountIn(slippage)),
        minimumReceived: uniswapCurrencyAmountTo(trade.minimumAmountOut(slippage)),
        fee: breakdown?.realizedLPFee ? uniswapCurrencyAmountTo(breakdown.realizedLPFee) : ZERO,
        trade_: trade,
    }
}
