import type { TradeComputed, SwapQuoteResponse } from '../../types'
import { useMemo } from 'react'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { SUPPORTED_CHAIN_ID_LIST } from './constants'
import { pick } from 'lodash-unified'
import { useAsync } from 'react-use'
import { useAccount, useWeb3 } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const { targetChainId } = TargetChainIdContext.useContainer()

    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        }
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (!web3 || !tradeComputed?.trade_ || !SUPPORTED_CHAIN_ID_LIST.includes(targetChainId) || !config) return 0
        return web3.eth.estimateGas(config)
    }, [targetChainId, tradeComputed, config, web3])
}
