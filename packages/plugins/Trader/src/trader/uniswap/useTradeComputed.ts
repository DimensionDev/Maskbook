import { ZERO } from '@masknet/web3-shared-base'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { TradeType } from '@uniswap/sdk-core'
import type { Web3Helper } from '@masknet/web3-helpers'
import { uniswap } from '@masknet/web3-providers/helpers'
import { type Trade, type TradeComputed, TradeStrategy } from '@masknet/web3-providers/types'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { useTradeBreakdown } from './useTradeBreakdown.js'

export function useTradeComputed(
    trade: Trade | null,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
): TradeComputed<Trade> | null {
    const slippageSetting = useSlippageTolerance()
    const breakdown = useTradeBreakdown(trade)
    const slippage = temporarySlippage ? uniswap.toUniswapPercent(temporarySlippage, 10000) : slippageSetting
    if (!trade) return null

    return {
        strategy: trade.tradeType === TradeType.EXACT_INPUT ? TradeStrategy.ExactIn : TradeStrategy.ExactOut,
        inputToken,
        outputToken,
        inputAmount: uniswap.uniswapCurrencyAmountTo(trade.inputAmount),
        outputAmount: uniswap.uniswapCurrencyAmountTo(trade.outputAmount),
        executionPrice: uniswap.uniswapPriceTo(trade.executionPrice),
        priceImpact: uniswap.uniswapPercentTo(breakdown?.priceImpact ?? trade.priceImpact),
        path: trade instanceof V2Trade ? trade.route.path.map((x) => [uniswap.uniswapTokenTo(x)]) : [],
        maximumSold: uniswap.uniswapCurrencyAmountTo(trade.maximumAmountIn(slippage)),
        minimumReceived: uniswap.uniswapCurrencyAmountTo(trade.minimumAmountOut(slippage)),
        fee: breakdown?.realizedLPFee ? uniswap.uniswapCurrencyAmountTo(breakdown.realizedLPFee) : ZERO,
        trade_: trade,
    }
}
