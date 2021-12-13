import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import type { SwapQuoteResponse, TradeComputed, TradeStrategy } from '../../types'

export function useTradeComputed(
    trade: SwapQuoteResponse | null,
    strategy: TradeStrategy,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null
        const inputAmount = new BigNumber(trade.sellAmount)
        const outputAmount = new BigNumber(trade.buyAmount)
        return {
            strategy,
            inputToken,
            outputToken,
            inputAmount,
            outputAmount,
            executionPrice: new BigNumber(trade.price),
            fee: new BigNumber(trade.minimumProtocolFee),
            maximumSold: new BigNumber(trade.sellAmount),
            minimumReceived: outputAmount,

            // minimumProtocolFee
            priceImpact: ZERO,

            trade_: { ...trade, buyAmount: outputAmount.toFixed() },
        } as TradeComputed<SwapQuoteResponse>
    }, [trade, strategy, inputToken, outputToken])
}
