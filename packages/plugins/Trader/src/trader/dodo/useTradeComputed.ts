import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { rightShift, ZERO } from '@masknet/web3-shared-base'
import { type SwapRouteData, type TradeComputed, TradeStrategy } from '../../types/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useTradeComputed(
    trade: SwapRouteData | null,
    strategy: TradeStrategy,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (!isExactIn) return null
        const inputAmount = rightShift(trade.fromAmount, inputToken.decimals).integerValue()
        const executionPrice = new BigNumber(trade.resPricePerToToken)
        const outputAmount = rightShift(trade.resAmount, outputToken.decimals).integerValue()
        const priceImpact = new BigNumber(trade.priceImpact)
        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            executionPrice,
            fee: ZERO,
            maximumSold: inputAmount,
            minimumReceived: new BigNumber(trade.fromAmount)
                .multipliedBy(trade.resPricePerFromToken)
                .multipliedBy(1 - trade.slippage / 100)
                .shiftedBy(outputToken.decimals),

            // minimumProtocolFee
            priceImpact,

            trade_: { ...trade },
        } as TradeComputed<SwapRouteData>
    }, [trade, strategy, inputToken, outputToken])
}
