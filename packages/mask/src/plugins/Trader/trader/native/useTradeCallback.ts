import { useAsyncFn } from 'react-use'
import { useNativeTokenWrapperCallback } from '@masknet/web3-hooks-evm'
import type { GasOptionConfig, ChainId } from '@masknet/web3-shared-evm'
import { TradeComputed, TradeStrategy } from '../../types/index.js'
import type { NativeTokenWrapper } from './useTradeComputed.js'
import { useWeb3State } from '@masknet/web3-hooks-base'

export function useTradeCallback(
    trade: TradeComputed<NativeTokenWrapper> | null,
    gasConfig?: GasOptionConfig,
    targetChainId?: ChainId,
) {
    const [wrapCallback, unwrapCallback] = useNativeTokenWrapperCallback(targetChainId)
    const { Others } = useWeb3State()
    return useAsyncFn(async () => {
        if (!trade?.trade_?.isNativeTokenWrapper) return
        if (!trade.inputToken || !trade.outputToken) return

        // input amount and output amount are the same value
        const tradeAmount = trade.inputAmount.toFixed()

        let result: string | undefined
        if (
            (trade.strategy === TradeStrategy.ExactIn && Others?.isNativeTokenSchemaType(trade.inputToken?.schema)) ||
            (trade.strategy === TradeStrategy.ExactOut && Others?.isNativeTokenSchemaType(trade.outputToken?.schema))
        ) {
            result = await wrapCallback(tradeAmount, gasConfig)
        } else {
            result = await unwrapCallback(false, tradeAmount)
        }
        return result
    }, [wrapCallback, unwrapCallback, trade, Others?.isNativeTokenSchemaType])
}
