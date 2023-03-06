import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useRemoveTransactionCallback<T extends NetworkPluginID>(pluginID?: T) {
    const { account, chainId } = useChainContext()
    const { Transaction, TransactionWatcher } = useWeb3State(pluginID)

    return useCallback(
        async (id: string) => {
            if (!account) return
            await TransactionWatcher?.unwatchTransaction(chainId, id)
            await Transaction?.removeTransaction?.(chainId, account, id)
        },
        [chainId, account, Transaction],
    )
}
