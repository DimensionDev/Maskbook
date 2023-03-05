import { ZERO } from '@masknet/web3-shared-base'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { TradeType } from '@uniswap/sdk-core'
import {
    toUniswapPercent,
    uniswapCurrencyAmountTo,
    uniswapPercentTo,
    uniswapPriceTo,
    uniswapTokenTo,
} from '../../helpers/index.js'
import { type Trade, type TradeComputed, TradeStrategy } from '../../types/index.js'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { useTradeBreakdown } from './useTradeBreakdown.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useTradeComputed(
    trade: Trade | null,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
): TradeComputed<Trade> | null {
    const slippageSetting = useSlippageTolerance()
    const breakdown = useTradeBreakdown(trade)
    const slippage = temporarySlippage ? toUniswapPercent(temporarySlippage, 10000) : slippageSetting
    if (!trade) return null

    return {
        strategy: trade.tradeType === TradeType.EXACT_INPUT ? TradeStrategy.ExactIn : TradeStrategy.ExactOut,
        inputToken,
        outputToken,
        inputAmount: uniswapCurrencyAmountTo(trade.inputAmount),
        outputAmount: uniswapCurrencyAmountTo(trade.outputAmount),
        executionPrice: uniswapPriceTo(trade.executionPrice),
        priceImpact: uniswapPercentTo(breakdown?.priceImpact ?? trade.priceImpact),
        path: trade instanceof V2Trade ? trade.route.path.map((x) => [uniswapTokenTo(x)]) : [],
        maximumSold: uniswapCurrencyAmountTo(trade.maximumAmountIn(slippage)),
        minimumReceived: uniswapCurrencyAmountTo(trade.minimumAmountOut(slippage)),
        fee: breakdown?.realizedLPFee ? uniswapCurrencyAmountTo(breakdown.realizedLPFee) : ZERO,
        trade_: trade,
    }
}
