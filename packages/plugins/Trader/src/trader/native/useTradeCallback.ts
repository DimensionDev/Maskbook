import { useAsyncFn } from 'react-use'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import type { GasConfig, ChainId } from '@masknet/web3-shared-evm'
import { useNativeTokenWrapperCallback } from '@masknet/web3-hooks-evm'
import { TraderAPI } from '@masknet/web3-providers/types'
import type { NativeTokenWrapper } from './useTradeComputed.js'

export function useTradeCallback(
    trade: TraderAPI.TradeComputed<NativeTokenWrapper> | null,
    gasConfig?: GasConfig,
    targetChainId?: ChainId,
) {
    const [wrapCallback, unwrapCallback] = useNativeTokenWrapperCallback(targetChainId)
    const Others = useWeb3Others()
    return useAsyncFn(async () => {
        if (!trade?.trade_?.isNativeTokenWrapper) return
        if (!trade.inputToken || !trade.outputToken) return

        // input amount and output amount are the same value
        const tradeAmount = trade.inputAmount.toFixed()

        let result: string | undefined
        if (
            (trade.strategy === TraderAPI.TradeStrategy.ExactIn &&
                Others.isNativeTokenSchemaType(trade.inputToken?.schema)) ||
            (trade.strategy === TraderAPI.TradeStrategy.ExactOut &&
                Others.isNativeTokenSchemaType(trade.outputToken?.schema))
        ) {
            result = await wrapCallback(tradeAmount, gasConfig)
        } else {
            result = await unwrapCallback(false, tradeAmount)
        }
        return result
    }, [wrapCallback, unwrapCallback, trade, Others.isNativeTokenSchemaType])
}
