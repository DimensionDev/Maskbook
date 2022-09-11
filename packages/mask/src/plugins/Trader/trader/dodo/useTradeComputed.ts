import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { FungibleToken, rightShift, ZERO } from '@masknet/web3-shared-base'
import { SwapRouteData, TradeComputed, TradeStrategy } from '../../types/index.js'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export function useTradeComputed(
    trade: SwapRouteData | null,
    strategy: TradeStrategy,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
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
