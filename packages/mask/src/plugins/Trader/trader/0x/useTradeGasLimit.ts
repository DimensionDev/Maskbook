import type { TradeComputed, SwapQuoteResponse } from '../../types'
import { useMemo } from 'react'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { SUPPORTED_CHAIN_ID_LIST } from './constants'
import { useAccount, useWeb3 } from '@masknet/web3-shared-evm'
import { pick } from 'lodash-unified'
import { useAsync } from 'react-use'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const { targetChainId } = TargetChainIdContext.useContainer()

    const web3 = useWeb3({ chainId: targetChainId })
    const account = useAccount()
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        }
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!tradeComputed?.trade_ || !SUPPORTED_CHAIN_ID_LIST.includes(targetChainId) || !config) return 0
        return web3.eth.estimateGas(config)
    }, [targetChainId, tradeComputed, config, web3])
}
