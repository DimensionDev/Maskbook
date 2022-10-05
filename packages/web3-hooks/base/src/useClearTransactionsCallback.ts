import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { getSubscriptionCurrentValue } from '@masknet/shared-base'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'

export function useClearTransactionsCallback<T extends NetworkPluginID>(pluginID?: T) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const { Transaction, TransactionWatcher } = useWeb3State(pluginID)

    return useCallback(async () => {
        if (!account) return

        try {
            const transactions = await getSubscriptionCurrentValue(() => Transaction?.transactions)
            for (const transaction of transactions?.flatMap((x) => Object.keys(x.candidates)) ?? []) {
                await TransactionWatcher?.unwatchTransaction(chainId, transaction)
            }
        } catch {
            console.warn('Failed to unwatch transaction.')
        }

        return Transaction?.clearTransactions?.(chainId, account)
    }, [chainId, account, Transaction])
}
