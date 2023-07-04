import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { ZERO, pow10 } from '@masknet/web3-shared-base'
import { type SwapOOData, type TradeComputed, TradeStrategy } from '../../types/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useTradeComputed(
    trade: SwapOOData | null,
    strategy: TradeStrategy,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (!isExactIn) return null
        const inputAmount = new BigNumber(trade.fromAmount).multipliedBy(pow10(inputToken.decimals)).integerValue()
        const executionPrice = new BigNumber(trade.resPricePerToToken)
        const outputAmount = new BigNumber(trade.resAmount).multipliedBy(pow10(outputToken.decimals)).integerValue()
        const priceImpact = new BigNumber(trade.priceImpact ?? 0)
        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            executionPrice,
            fee: ZERO,
            maximumSold: inputAmount,
            minimumReceived: new BigNumber(trade.minOutAmount),
            // minimumProtocolFee
            priceImpact,

            trade_: { ...trade },
        } as TradeComputed<SwapOOData>
    }, [trade, strategy, inputToken, outputToken])
}
