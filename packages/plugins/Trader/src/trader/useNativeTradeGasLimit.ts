import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useNativeTokenWrapperContract } from '@masknet/web3-hooks-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type TradeComputed, TradeStrategy } from '@masknet/web3-providers/types'
import type { NativeTokenWrapper } from './native/useTradeComputed.js'

export function useNativeTradeGasLimit(
    trade: TradeComputed<NativeTokenWrapper> | null,
    chainId?: Web3Helper.ChainIdAll,
): AsyncState<string> {
    const { account } = useChainContext()
    const { pluginID } = useNetworkContext()
    const Others = useWeb3Others()
    const wrapperContract = useNativeTokenWrapperContract(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
    )
    return useAsync(async () => {
        if (
            !trade?.trade_?.isNativeTokenWrapper ||
            !trade.inputToken ||
            !trade.outputToken ||
            pluginID !== NetworkPluginID.PLUGIN_EVM
        )
            return '0'

        const tradeAmount = trade.inputAmount.toFixed()

        if (!tradeAmount || !wrapperContract) return '0'

        if (
            (trade.strategy === TradeStrategy.ExactIn && Others.isNativeTokenSchemaType(trade.inputToken.schema)) ||
            (trade.strategy === TradeStrategy.ExactOut && Others.isNativeTokenSchemaType(trade.outputToken.schema))
        ) {
            const tx = await new ContractTransaction(wrapperContract).fillAll(wrapperContract.methods.deposit(), {
                from: account,
                value: tradeAmount,
            })

            return tx.gas ?? '0'
        }

        return '0'
    }, [account, wrapperContract, trade, pluginID, Others.isNativeTokenSchemaType])
}
