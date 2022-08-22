import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { ZERO, pow10, FungibleToken } from '@masknet/web3-shared-base'
import { SwapOOData, TradeComputed, TradeStrategy } from '../../types'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export function useTradeComputed(
    trade: SwapOOData | null,
    strategy: TradeStrategy,
    inputToken?: FungibleToken<ChainId, SchemaType>,
    outputToken?: FungibleToken<ChainId, SchemaType>,
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
