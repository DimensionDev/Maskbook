import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { ZERO, pow10 } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TraderAPI } from '@masknet/web3-providers/types'
import type { SwapOOData } from '../../types/index.js'

export function useTradeComputed(
    trade: SwapOOData | null,
    strategy: TraderAPI.TradeStrategy,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TraderAPI.TradeStrategy.ExactIn
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
        } as TraderAPI.TradeComputed<SwapOOData>
    }, [trade, strategy, inputToken, outputToken])
}
