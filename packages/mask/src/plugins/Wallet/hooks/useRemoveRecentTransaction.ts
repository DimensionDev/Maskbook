import { useAccount, useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/public-api'
import { useCallback } from 'react'

export function useRemoveRecentTransaction() {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { Transaction } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    return useCallback(
        async (hash: string) => {
            if (!account || !hash || !Transaction) return
            return Transaction.removeTransaction?.(chainId, account, hash)
        },
        [chainId, account],
    )
}
