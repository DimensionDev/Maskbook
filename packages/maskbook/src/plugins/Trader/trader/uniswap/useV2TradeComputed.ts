import { Trade, TradeType } from '@uniswap/sdk'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { uniswapCurrencyAmountTo, uniswapPercentTo, uniswapPriceTo, uniswapTokenTo } from '../../helpers'
import { TradeComputed, TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { useV2TradeBreakdown } from './useV2TradeBreakdown'
import { ZERO } from '@masknet/shared'

export function useV2TradeComputed(
    trade: Trade | null,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
): TradeComputed<Trade> | null {
    const slippage = useSlippageTolerance()
    const breakdown = useV2TradeBreakdown(trade)

    if (!trade) return null
    return {
        strategy: trade.tradeType === TradeType.EXACT_INPUT ? TradeStrategy.ExactIn : TradeStrategy.ExactOut,
        inputToken,
        outputToken,
        inputAmount: uniswapCurrencyAmountTo(trade.inputAmount),
        outputAmount: uniswapCurrencyAmountTo(trade.outputAmount),
        nextMidPrice: uniswapPriceTo(trade.nextMidPrice),
        executionPrice: uniswapPriceTo(trade.executionPrice),
        priceImpact: uniswapPercentTo(trade.priceImpact),
        path: trade.route.path.map((x) => [uniswapTokenTo(x)]),
        maximumSold: uniswapCurrencyAmountTo(trade.maximumAmountIn(slippage)),
        minimumReceived: uniswapCurrencyAmountTo(trade.minimumAmountOut(slippage)),
        priceImpactWithoutFee: breakdown?.priceImpactWithoutFee
            ? uniswapPercentTo(breakdown.priceImpactWithoutFee)
            : ZERO,
        fee: breakdown?.realizedLPFee ? uniswapCurrencyAmountTo(breakdown.realizedLPFee) : ZERO,
        trade_: trade,
    }
}
