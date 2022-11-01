import { useMemo } from 'react'
import { FungibleToken, rightShift, ZERO } from '@masknet/web3-shared-base'
import type { SwapBancorRequest, TradeComputed, TradeStrategy } from '../../types/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
export function useTradeComputed(
    trade: SwapBancorRequest | null,
    strategy: TradeStrategy,
    inputToken?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
    outputToken?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null

        const inputAmountWei = rightShift(trade.fromAmount || '0', inputToken.decimals)
        const outputAmountWei = rightShift(trade.toAmount || '0', outputToken.decimals)
        const minimumReceivedWei = rightShift(trade.minimumReceived, outputToken.decimals)

        const tradeComputed: TradeComputed<SwapBancorRequest> = {
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
