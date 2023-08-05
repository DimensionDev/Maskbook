import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useMemo } from 'react'
import format from 'date-fns/format'
import { useI18N } from '../../../../../utils/index.js'
import type { TransactionState } from './types.js'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useWeb3State } from '@masknet/web3-hooks-base'
import type { RecentTransaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction as EvmTransaction } from '@masknet/web3-shared-evm'

/**
 * Prefer to list online transaction.
 * But only local transaction record activity logs.
 * Would try to get activity from local record transaction for online transaction
 */
export function useTransactionLogs(transactionState: TransactionState) {
    const { t } = useI18N()
    const isRecentTx = transactionState && 'candidates' in transactionState
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { Transaction } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { data: txes } = useQuery({
        enabled: transactionState && !isRecentTx,
        // Could already be cached through ActivityList page.
        queryKey: ['transactions', transactionState?.chainId, account],
        queryFn: async () => {
            if (!transactionState?.chainId) return
            return Transaction?.getTransactions?.(transactionState?.chainId, account) ?? []
        },
    })
    const logs = useMemo(() => {
        if (!transactionState) return EMPTY_LIST
        let localTransaction: RecentTransaction<ChainId, EvmTransaction> | undefined = undefined
        const isRecentTx = 'candidates' in transactionState
        if (isRecentTx) {
            localTransaction = transactionState
        }
        if (!isRecentTx) {
            localTransaction = txes?.find((x) => x.id === transactionState.hash)
        }
        if (localTransaction) {
            return [
                t('transaction_confirmed_at', {
                    datetime: format(localTransaction.createdAt, "HH:mm 'on' M/dd/yyyy"),
                }),
                t('transaction_completed_at', {
                    datetime: format(localTransaction.updatedAt, "HH:mm 'on' M/dd/yyyy"),
                }),
            ].filter(Boolean)
        }
        return EMPTY_LIST
    }, [transactionState, t])

    return logs
}
