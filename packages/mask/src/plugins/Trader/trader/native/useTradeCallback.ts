import { EthereumTokenType, GasOptionConfig, useNativeTokenWrapperCallback } from '@masknet/web3-shared-evm'
import { useCallback, useState } from 'react'
import { TradeComputed, TradeStrategy } from '../../types'
import type { NativeTokenWrapper } from './useTradeComputed'

export function useTradeCallback(trade: TradeComputed<NativeTokenWrapper> | null, gasConfig?: GasOptionConfig) {
    const [wrapCallback, unwrapCallback] = useNativeTokenWrapperCallback()
    const [loading, setLoading] = useState(false)

    const callback = useCallback(async () => {
        if (!trade?.trade_?.isNativeTokenWrapper) return
        if (!trade.inputToken || !trade.outputToken) return

        setLoading(true)
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
        setLoading(false)
        return result
    }, [wrapCallback, unwrapCallback])

    return [loading, callback] as const
}
