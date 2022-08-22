import { ChainId, encodeContractTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import type { TradeComputed } from '../types'
import type { NativeTokenWrapper } from './native/useTradeComputed'
import { TradeStrategy } from '../types'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { useAccount, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useNativeTokenWrapperContract } from '@masknet/plugin-infra/web3-evm'
import BigNumber from 'bignumber.js'

export function useNativeTradeGasLimit(
    trade: TradeComputed<NativeTokenWrapper> | null,
    chainId?: ChainId,
): AsyncState<number> {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const wrapperContract = useNativeTokenWrapperContract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useAsync(async () => {
        if (
            !trade?.trade_?.isNativeTokenWrapper ||
            !trade.inputToken ||
            !trade.outputToken ||
            !connection?.estimateTransaction
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
    }, [account, wrapperContract, trade])
}
