import { useNativeTokenWrapperCallback } from '@masknet/plugin-infra/web3-evm'
import { SchemaType, GasOptionConfig } from '@masknet/web3-shared-evm'
import { TradeComputed, TradeStrategy } from '../../types'
import type { NativeTokenWrapper } from './useTradeComputed'

export function useTradeCallback(trade: TradeComputed<NativeTokenWrapper> | null, gasConfig?: GasOptionConfig) {
    const [transactionState, wrapCallback, unwrapCallback, resetCallback] = useNativeTokenWrapperCallback()

    return [
        transactionState,
        async () => {
            if (!trade?.trade_?.isNativeTokenWrapper) return
            if (!trade.inputToken || !trade.outputToken) return

            // input amount and output amount are the same value
            const tradeAmount = trade.inputAmount.toFixed()

            if (
                (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.schema === SchemaType.Native) ||
                (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.schema === SchemaType.Native)
            ) {
                wrapCallback(tradeAmount, gasConfig)
                return
            }
            unwrapCallback(false, tradeAmount)
        },
        resetCallback,
    ] as const
}
