import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-evm'
import { SwapRouteData, TradeComputed, TradeStrategy } from '../../types'

export function useTradeComputed(
    trade: SwapRouteData | null,
    strategy: TradeStrategy,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (!isExactIn) return null
        const inputAmount = new BigNumber(trade.fromAmount).shiftedBy(inputToken.decimals).integerValue()
        const executionPrice = new BigNumber(trade.resPricePerToToken)
        const outputAmount = new BigNumber(trade.resAmount).shiftedBy(outputToken.decimals).integerValue()
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
