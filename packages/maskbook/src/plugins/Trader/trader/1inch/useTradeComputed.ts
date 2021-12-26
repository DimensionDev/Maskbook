import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-evm'
import type { SwapQuoteOneResponse, TradeComputed, TradeStrategy } from '../../types'

export function useTradeComputed(
    trade: SwapQuoteOneResponse | null,
    strategy: TradeStrategy,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const inputAmount = new BigNumber(trade.fromTokenAmount)
        const outputAmount = new BigNumber(trade.toTokenAmount)
        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            executionPrice: new BigNumber(trade.tx.value),
            fee: new BigNumber(trade.tx.gas),
            maximumSold: new BigNumber(trade.toTokenAmount),
            minimumReceived: outputAmount,

            // minimumProtocolFee
            priceImpact: ZERO,

            trade_: { ...trade, buyAmount: outputAmount.toFixed() },
        } as TradeComputed<SwapQuoteOneResponse>
    }, [trade, strategy, inputToken, outputToken])
}
