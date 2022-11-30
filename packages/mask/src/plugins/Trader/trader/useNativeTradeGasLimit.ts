import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { BigNumber } from 'bignumber.js'
import { ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useNativeTokenWrapperContract } from '@masknet/web3-hooks-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { TradeComputed } from '../types/index.js'
import type { NativeTokenWrapper } from './native/useTradeComputed.js'
import { TradeStrategy } from '../types/index.js'

export function useNativeTradeGasLimit(
    trade: TradeComputed<NativeTokenWrapper> | null,
    chainId?: Web3Helper.ChainIdAll,
): AsyncState<number> {
    const { account } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { Others } = useWeb3State()
    const wrapperContract = useNativeTokenWrapperContract(
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
    )
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useAsync(async () => {
        if (
            !trade?.trade_?.isNativeTokenWrapper ||
            !trade.inputToken ||
            !trade.outputToken ||
            !connection?.estimateTransaction ||
            pluginID !== NetworkPluginID.PLUGIN_EVM
        )
            return 0

        const tradeAmount = trade.inputAmount.toFixed()

        if (!tradeAmount || !wrapperContract) return 0

        if (
            (trade.strategy === TradeStrategy.ExactIn && Others?.isNativeTokenSchemaType(trade.inputToken.schema)) ||
            (trade.strategy === TradeStrategy.ExactOut && Others?.isNativeTokenSchemaType(trade.outputToken.schema))
        ) {
            const tx = await new ContractTransaction(wrapperContract).fillAll(wrapperContract.methods.deposit(), {
                from: account,
                value: tradeAmount,
            })

            return new BigNumber(tx.gas!).toNumber()
        }

        return 0
    }, [account, wrapperContract, trade, pluginID, Others?.isNativeTokenSchemaType])
}
