import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { pick } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import type { TransactionConfig } from 'web3-core'
import type { SwapOOData, TradeComputed } from '../../types'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useAccount, useWeb3 } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapOOData> | null): AsyncState<number> {
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
        if (tradeComputed?.trade_?.estimatedGas) return new BigNumber(tradeComputed.trade_.estimatedGas).toNumber()
        if (!config || !web3) return 0
        return web3.eth.estimateGas(config)
    }, [config, web3, tradeComputed?.trade_?.estimatedGas])
}
