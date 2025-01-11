import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useMemo } from 'react'
import { format } from 'date-fns'
import type { TransactionState } from './types.js'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useAccount, useWeb3State } from '@masknet/web3-hooks-base'
import type { RecentTransaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction as EvmTransaction } from '@masknet/web3-shared-evm'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'

/**
 * Prefer to list online transaction.
 * But only local transaction record activity logs.
 * Would try to get activity from local record transaction for online transaction
 */
export function useTransactionLogs(transactionState: TransactionState) {
    const { _ } = useLingui()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { Transaction } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const chainId = transactionState?.chainId
    const { data: txes } = useQuery({
        enabled: transactionState && !('candidates' in transactionState),
        // Could already be cached through ActivityList page.
        queryKey: ['transactions', chainId, account],
        networkMode: 'always',
        queryFn: chainId ? async () => Transaction?.getTransactions?.(chainId, account) ?? EMPTY_LIST : skipToken,
    })
    const logs = useMemo(() => {
        if (!transactionState) return EMPTY_LIST
        const isRecentTx = 'candidates' in transactionState
        const localTransaction: RecentTransaction<ChainId, EvmTransaction> | undefined =
            isRecentTx ? transactionState : txes?.find((x) => x.id === transactionState.id)
        if (localTransaction) {
            return [
                _(msg`The transaction was confirmed at ${format(localTransaction.createdAt, "HH:mm 'on' M/dd/yyyy")}`),
                _(
                    msg`The transaction was complete and has been recorded on blockchain at ${format(localTransaction.updatedAt, "HH:mm 'on' M/dd/yyyy")}`,
                ),
            ].filter(Boolean)
        }
        return EMPTY_LIST
    }, [transactionState, _, txes])

    return logs
}
