import type { TradeComputed, SwapQuoteResponse } from '../../types/index.js'
import { useMemo } from 'react'
import { SUPPORTED_CHAIN_ID_LIST } from './constants.js'
import { pick } from 'lodash-unified'
import { useAsync } from 'react-use'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'

export function useTradeGasLimit(tradeComputed: TradeComputed<SwapQuoteResponse> | null) {
    const targetChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
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
            !SUPPORTED_CHAIN_ID_LIST.includes(targetChainId) ||
            !config
        )
            return 0
        const gas = await connection.estimateTransaction(config)
        return new BigNumber(gas).toNumber()
    }, [targetChainId, tradeComputed, config, connection])
}
