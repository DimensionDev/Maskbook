import { ZERO, FungibleTokenDetailed } from '@masknet/web3-shared'
import type { Trade } from '@uniswap/v2-sdk'
import { Currency, TradeType } from '@uniswap/sdk-core'
import { uniswapCurrencyAmountTo, uniswapPercentTo, uniswapPriceTo, uniswapTokenTo } from '../../helpers'
import { TradeComputed, TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { useV2TradeBreakdown } from './useV2TradeBreakdown'

export function useV2TradeComputed(
    trade: Trade<Currency, Currency, TradeType> | null,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
): TradeComputed<Trade<Currency, Currency, TradeType>> | null {
    const slippage = useSlippageTolerance()
    const breakdown = useV2TradeBreakdown(trade)

    if (!trade) return null

    return {
        strategy: trade.tradeType === TradeType.EXACT_INPUT ? TradeStrategy.ExactIn : TradeStrategy.ExactOut,
        inputToken,
        outputToken,
        inputAmount: uniswapCurrencyAmountTo(trade.inputAmount),
        outputAmount: uniswapCurrencyAmountTo(trade.outputAmount),
        executionPrice: uniswapPriceTo(trade.executionPrice),
        priceImpact: uniswapPercentTo(breakdown?.priceImpact ?? trade.priceImpact),
        path: trade.route.path.map((x) => [uniswapTokenTo(x)]),
        maximumSold: uniswapCurrencyAmountTo(trade.maximumAmountIn(slippage)),
        minimumReceived: uniswapCurrencyAmountTo(trade.minimumAmountOut(slippage)),
        fee: breakdown?.realizedLPFee ? uniswapCurrencyAmountTo(breakdown.realizedLPFee) : ZERO,
        trade_: trade,
    }
}
