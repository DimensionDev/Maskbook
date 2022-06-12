import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import { getSubscriptionCurrentValue } from '@masknet/shared-base'

export function useClearTransactionsCallback<T extends NetworkPluginID>(pluginID?: T) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const { Transaction, TransactionWatcher } = useWeb3State(pluginID)

    return useCallback(async () => {
        if (!account) return

        try {
            const transactions = await getSubscriptionCurrentValue(() => Transaction?.transactions)
            transactions
                ?.flatMap((x) => Object.keys(x.candidates))
                .forEach((x) => TransactionWatcher?.unwatchTransaction(chainId, x))
        } catch {
            console.warn('Failed to unwatch transaction.')
        }

        return Transaction?.clearTransactions?.(chainId, account)
    }, [chainId, account, Transaction])
}
