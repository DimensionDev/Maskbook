import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-evm'
import type { SwapBancorRequest, TradeComputed, TradeStrategy } from '../../types'

export function useTradeComputed(
    trade: SwapBancorRequest | null,
    strategy: TradeStrategy,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    return useMemo(() => {
        if (!trade) return null
        if (!inputToken || !outputToken) return null

        const inputAmountWei = new BigNumber(trade.fromAmount || '0').shiftedBy(inputToken.decimals ?? 0)
        const outputAmountWei = new BigNumber(trade.toAmount || '0').shiftedBy(outputToken.decimals ?? 0)
        const minimumReceivedWei = new BigNumber(trade.minimumReceived).shiftedBy(outputToken.decimals ?? 0)

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
