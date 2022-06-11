import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useClearTransactionsCallback<T extends NetworkPluginID>(pluginID?: T) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const { Transaction } = useWeb3State(pluginID)

    return useCallback(async () => {
        if (!account) return
        return Transaction?.clearTransactions?.(chainId, account)
    }, [chainId, account, Transaction])
}
