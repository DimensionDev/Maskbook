import { useAsyncFn } from 'react-use'
import { useNativeTokenWrapperCallback } from '@masknet/plugin-infra/web3-evm'
import { SchemaType, GasOptionConfig, ChainId } from '@masknet/web3-shared-evm'
import { TradeComputed, TradeStrategy } from '../../types/index.js'
import type { NativeTokenWrapper } from './useTradeComputed.js'

export function useTradeCallback(
    trade: TradeComputed<NativeTokenWrapper> | null,
    gasConfig?: GasOptionConfig,
    targetChainId?: ChainId,
) {
    const [wrapCallback, unwrapCallback] = useNativeTokenWrapperCallback(targetChainId)

    return useAsyncFn(async () => {
        if (!trade?.trade_?.isNativeTokenWrapper) return
        if (!trade.inputToken || !trade.outputToken) return

        // input amount and output amount are the same value
        const tradeAmount = trade.inputAmount.toFixed()

        let result: string | undefined
        if (
            (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.schema === SchemaType.Native) ||
            (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.schema === SchemaType.Native)
        ) {
            result = await wrapCallback(tradeAmount, gasConfig)
        } else {
            result = await unwrapCallback(false, tradeAmount)
        }
        return result
    }, [wrapCallback, unwrapCallback, trade])
}
