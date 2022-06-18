import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { pick } from 'lodash-unified'
import type { SwapRouteData, TradeComputed } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import type { TransactionConfig } from 'web3-core'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useWeb3 } from '@masknet/plugin-infra/web3'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapRouteData> | null): AsyncState<number> {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!config || !web3) return 0
        return web3.eth.estimateGas(config)
    }, [config, web3])
}
