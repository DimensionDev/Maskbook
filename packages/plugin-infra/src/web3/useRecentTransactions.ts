import { useMemo } from 'react'
import { Subscription, useSubscription } from 'use-subscription'
import type {
    NetworkPluginID,
    RecentTransaction,
    RecentTransactionComputed,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { EMPTY_ARRAY } from '../utils/subscription'

export function useRecentTransactions<T extends NetworkPluginID>(pluginID?: T, status?: TransactionStatusType) {
    type TransactionComputed = RecentTransactionComputed<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['Transaction']
    >

    const { Transaction } = useWeb3State(pluginID)
    const transactions = useSubscription(
        (Transaction?.transactions ?? EMPTY_ARRAY) as Subscription<
            Array<RecentTransaction<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['Transaction']>>
        >,
    )
    return useMemo<TransactionComputed[]>(() => {
        return (status ? transactions.filter((x) => status === x.status) : transactions).map((x) => ({
            ...x,
            _tx: x.candidates[x.indexId],
        }))
    }, [status, transactions])
}
