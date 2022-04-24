import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { useWeb3State, NetworkPluginID, TransactionStatusType } from '../entry-web3'
import { EMPTY_ARRAY } from '../utils/subscription'

export function useTransactions<T extends NetworkPluginID>(pluginID?: T, status?: TransactionStatusType) {
    const { Transaction } = useWeb3State(pluginID)
    const transactions = useSubscription(Transaction?.transactions ?? EMPTY_ARRAY)

    return useMemo(() => {
        return typeof status === 'undefined' ? transactions : transactions.filter((x) => status === x.status)
    }, [status])
}
