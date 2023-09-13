import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { TraderAPI } from '@masknet/web3-providers/types'
import type { SwapQuoteResponse } from '../../types/index.js'

export function useTradeComputed(
    trade: SwapQuoteResponse | null,
    strategy: TraderAPI.TradeStrategy,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
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
        } as TraderAPI.TradeComputed<SwapQuoteResponse>
    }, [trade, strategy, inputToken, outputToken])
}
