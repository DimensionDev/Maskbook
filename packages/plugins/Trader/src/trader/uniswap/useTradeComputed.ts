import { ZERO } from '@masknet/web3-shared-base'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { TradeType } from '@uniswap/sdk-core'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TraderAPI } from '@masknet/web3-providers/types'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { useTradeBreakdown } from './useTradeBreakdown.js'
import {
    uniswapCurrencyAmountTo,
    uniswapPriceTo,
    uniswapPercentTo,
    uniswapTokenTo,
    toUniswapPercent,
} from '../../helpers/index.js'
import type { Trade } from '../../types/index.js'

export function useTradeComputed(
    trade: Trade | null,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
): TraderAPI.TradeComputed<Trade> | null {
    const slippageSetting = useSlippageTolerance()
    const breakdown = useTradeBreakdown(trade)
    const slippage = temporarySlippage ? toUniswapPercent(temporarySlippage, 10000) : slippageSetting
    if (!trade) return null

    return {
        strategy:
            trade.tradeType === TradeType.EXACT_INPUT
                ? TraderAPI.TradeStrategy.ExactIn
                : TraderAPI.TradeStrategy.ExactOut,
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
