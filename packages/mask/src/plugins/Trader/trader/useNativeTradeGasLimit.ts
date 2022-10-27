import { ChainId, encodeContractTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import type { TradeComputed } from '../types/index.js'
import type { NativeTokenWrapper } from './native/useTradeComputed.js'
import { TradeStrategy } from '../types/index.js'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useNativeTokenWrapperContract } from '@masknet/web3-hooks-evm'
import BigNumber from 'bignumber.js'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useNativeTradeGasLimit(
    trade: TradeComputed<NativeTokenWrapper> | null,
    chainId?: Web3Helper.ChainIdAll,
): AsyncState<number> {
    const { account } = useChainContext()
    const { pluginID } = useNetworkContext()
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
            (trade.strategy === TradeStrategy.ExactIn && trade.inputToken.schema === SchemaType.Native) ||
            (trade.strategy === TradeStrategy.ExactOut && trade.outputToken.schema === SchemaType.Native)
        ) {
            const tx = await encodeContractTransaction(wrapperContract, wrapperContract.methods.deposit(), {
                from: account,
                value: tradeAmount,
            })
            const gas = await connection.estimateTransaction(tx)
            return new BigNumber(gas).toNumber()
        }

        return 0
    }, [account, wrapperContract, trade, pluginID])
}
