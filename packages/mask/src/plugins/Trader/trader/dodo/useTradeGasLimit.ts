import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { pick } from 'lodash-unified'
import type { SwapRouteData, TradeComputed } from '../../types/index.js'
import type { TransactionConfig } from 'web3-core'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/web3-hooks-base'
import BigNumber from 'bignumber.js'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapRouteData> | null): AsyncState<number> {
    const targetChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!config || !connection?.estimateTransaction) return 0

        const gas = await connection.estimateTransaction(config)
        return new BigNumber(gas).toNumber()
    }, [config, connection])
}
