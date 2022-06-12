import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useRemoveTransactionCallback<T extends NetworkPluginID>(pluginID?: T) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const { Transaction, TransactionWatcher } = useWeb3State(pluginID)

    return useCallback(
        async (id: string) => {
            if (!account) return
            TransactionWatcher?.unwatchTransaction(chainId, id)
            return Transaction?.removeTransaction?.(chainId, account, id)
        },
        [chainId, account, Transaction],
    )
}
