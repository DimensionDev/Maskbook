import { useMemo } from 'react'
import type { RecentTransactionComputed, TransactionStatusType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useRecentTransactions<T extends NetworkPluginID>(pluginID?: T, status?: TransactionStatusType) {
    const { Transaction } = useWeb3State(pluginID)
    const transactions = useSubscriptionMaybe(Transaction?.transactions, EMPTY_LIST)

    type ChainId = Web3Helper.Definition[T]['ChainId']
    type Tx = Web3Helper.Definition[T]['Transaction']

    return useMemo<Array<RecentTransactionComputed<ChainId, Tx>>>(() => {
        return (status ? transactions.filter((x) => status === x.status) : transactions).map((x) => ({
            ...x,
            _tx: x.candidates[x.indexId],
        }))
    }, [status, transactions])
}
