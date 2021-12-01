import { EthereumTokenType, useNativeTokenWrapperCallback } from '@masknet/web3-shared-evm'
import { TradeComputed, TradeStrategy } from '../../types'
import type { NativeTokenWrapper } from './useTradeComputed'

export function useTradeCallback(trade: TradeComputed<NativeTokenWrapper> | null) {
    const [transactionState, wrapCallback, unwrapCallback, resetCallback] = useNativeTokenWrapperCallback()

    return [
        transactionState,
        async () => {
            if (!trade?.trade_?.isNativeTokenWrapper) return
            if (!trade.inputToken || !trade.outputToken) return

            // input amount and output amount are the same value
            const tradeAmount = trade.inputAmount.toFixed()

            if (
                (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.type === EthereumTokenType.Native) ||
                (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.type === EthereumTokenType.Native)
            ) {
                wrapCallback(tradeAmount)
                return
            }
            unwrapCallback(false, tradeAmount)
        },
        resetCallback,
    ] as const
}
