import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { rightShift, ZERO } from '@masknet/web3-shared-base'
import { WoofiSwapData, TradeComputed, TradeStrategy } from '../../types'
import { SLIPPAGE_DEFAULT } from '../../constants'
import { calculateMinimumReceived } from '../../helpers'

export function useTradeComputed(
    trade: WoofiSwapData | null,
    strategy: TradeStrategy,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
    slippage: number = SLIPPAGE_DEFAULT,
): TradeComputed<WoofiSwapData> | null {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (!isExactIn) return null
        const inputAmount = rightShift(trade.fromAmount, inputToken.decimals).integerValue()
        const executionPrice = new BigNumber(trade.price)
        const outputAmount = rightShift(trade.toAmount, outputToken.decimals).integerValue()

        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            executionPrice,
            fee: ZERO,
            maximumSold: inputAmount,
            priceImpact: ZERO,
            minimumReceived: calculateMinimumReceived({ toAmount: outputAmount, toToken: outputToken, slippage }),

            trade_: { ...trade },
        }
    }, [trade, strategy, inputToken, outputToken])
}
