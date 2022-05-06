import { EthereumTokenType, GasOptionConfig, useNativeTokenWrapperCallback } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { TradeComputed, TradeStrategy } from '../../types'
import type { NativeTokenWrapper } from './useTradeComputed'

export function useTradeCallback(trade: TradeComputed<NativeTokenWrapper> | null, gasConfig?: GasOptionConfig) {
    const [wrapCallback, unwrapCallback] = useNativeTokenWrapperCallback()

    return useAsyncFn(async () => {
        if (!trade?.trade_?.isNativeTokenWrapper) return
        if (!trade.inputToken || !trade.outputToken) return

        // input amount and output amount are the same value
        const tradeAmount = trade.inputAmount.toFixed()

        let result: string | undefined
        if (
            (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.type === EthereumTokenType.Native) ||
            (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.type === EthereumTokenType.Native)
        ) {
            result = await wrapCallback(tradeAmount, gasConfig)
        } else {
            result = await unwrapCallback(false, tradeAmount)
        }
        return result
    }, [wrapCallback, unwrapCallback])
}
