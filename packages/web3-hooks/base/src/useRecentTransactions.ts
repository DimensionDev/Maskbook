import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import type { RecentTransactionComputed, TransactionStatusType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useRecentTransactions<T extends NetworkPluginID>(pluginID?: T, status?: TransactionStatusType) {
    const { Transaction } = useWeb3State(pluginID)
    const transactions = useSubscription(Transaction?.transactions ?? EMPTY_ARRAY)
    type ChainId = Web3Helper.Definition[T]['ChainId']
    type Transaction = Web3Helper.Definition[T]['Transaction']

    return useMemo<Array<RecentTransactionComputed<ChainId, Transaction>>>(() => {
        return (status ? transactions.filter((x) => status === x.status) : transactions).map((x) => ({
            ...x,
            _tx: x.candidates[x.indexId],
        }))
    }, [status, transactions])
}
