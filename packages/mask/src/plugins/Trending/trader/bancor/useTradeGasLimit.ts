import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { pick } from 'lodash-unified'
import type { SwapBancorRequest, TradeComputed } from '../../types'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { PluginTraderRPC } from '../../messages'
import { useAccount, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapBancorRequest> | null): AsyncState<number> {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })

    const trade: SwapBancorRequest | null = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return tradeComputed.trade_
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!account || !trade || !connection?.estimateTransaction) return 0

        const [data, err] = await PluginTraderRPC.swapTransactionBancor(trade)

        if (err) return 0

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const tradeTransaction = data.length === 1 ? data[0] : data[1]

        // return web3.eth.estimateGas()
        const gas = await connection.estimateTransaction(
            pick(tradeTransaction.transaction, ['to', 'data', 'value', 'from']),
        )
        return new BigNumber(gas).toNumber()
    }, [trade, account, connection])
}
