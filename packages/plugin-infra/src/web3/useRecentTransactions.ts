import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import type { NetworkPluginID, RecentTransactionComputed, TransactionStatusType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { EMPTY_ARRAY } from '../utils/subscription'

export function useRecentTransactions<T extends NetworkPluginID>(pluginID?: T, status?: TransactionStatusType) {
    const { Transaction } = useWeb3State(pluginID)
    const transactions = useSubscription(Transaction?.transactions ?? EMPTY_ARRAY)
    return useMemo<
        Array<RecentTransactionComputed<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['Transaction']>>
    >(() => {
        return (status ? transactions.filter((x) => status === x.status) : transactions).map((x) => ({
            ...x,
            _tx: x.candidates[x.indexId],
        }))
    }, [status, transactions])
}
