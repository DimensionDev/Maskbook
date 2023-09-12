import { useMemo } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { rightShift, ZERO } from '@masknet/web3-shared-base'
import type { TraderAPI } from '@masknet/web3-providers/types'
import type { SwapBancorRequest } from '../../types/index.js'

export function useTradeComputed(
    trade: SwapBancorRequest | null,
    strategy: TraderAPI.TradeStrategy,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null

        const inputAmountWei = rightShift(trade.fromAmount || '0', inputToken.decimals)
        const outputAmountWei = rightShift(trade.toAmount || '0', outputToken.decimals)
        const minimumReceivedWei = rightShift(trade.minimumReceived, outputToken.decimals)

        const tradeComputed: TraderAPI.TradeComputed<SwapBancorRequest> = {
            strategy,
            inputToken,
            outputToken,
            inputAmount: inputAmountWei,
            outputAmount: outputAmountWei,
            executionPrice: ZERO,
            fee: ZERO,
            maximumSold: inputAmountWei,
            minimumReceived: minimumReceivedWei,
            priceImpact: ZERO,
            trade_: { ...trade },
        }
        return tradeComputed
    }, [trade, strategy, inputToken, outputToken])
}
