import type { TradeComputed, SwapQuoteResponse } from '../../types/index.js'
import { useMemo } from 'react'
import { SUPPORTED_CHAIN_ID_LIST } from './constants.js'
import { pick } from 'lodash-unified'
import { useAsync } from 'react-use'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import BigNumber from 'bignumber.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const { account, chainId: targetChainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId: targetChainId })
    const config = useMemo(() => {
        if (!account || !tradeComputed?.trade_) return null
        return {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        }
    }, [account, tradeComputed])

    return useAsync(async () => {
        if (
            !connection?.estimateTransaction ||
            !tradeComputed?.trade_ ||
            pluginID !== NetworkPluginID.PLUGIN_EVM ||
            !SUPPORTED_CHAIN_ID_LIST.includes(targetChainId as ChainId) ||
            !config
        )
            return 0
        const gas = await connection.estimateTransaction(config)
        return new BigNumber(gas).toNumber()
    }, [targetChainId, tradeComputed, config, connection, pluginID])
}
