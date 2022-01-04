import type { SwapRouteData, TradeComputed } from '../../types'
import { useMemo } from 'react'
import { useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { pick } from 'lodash-unified'
import type { TransactionConfig } from 'web3-core'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapRouteData> | null): AsyncState<number> {
    const { targetChainId } = TargetChainIdContext.useContainer()

    const web3 = useWeb3(false, targetChainId)
    const account = useAccount()
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as TransactionConfig
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!config) return 0
        return web3.eth.estimateGas(config)
    }, [config, web3])
}
