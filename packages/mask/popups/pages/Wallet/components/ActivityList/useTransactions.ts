import { EMPTY_LIST, hidingScamSettings } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { useChainContext, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { DeBankHistory } from '@masknet/web3-providers'
import { type RecentTransaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction as EvmTransaction } from '@masknet/web3-shared-evm'
import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import { sortBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'

/**
 * Get locale transitions and merge them with ones from debank history.
 * Transactions from debank are fetching page by page.
 */
export function useTransactions() {
    const { account } = useChainContext()
    const result = useInfiniteQuery({
        queryKey: ['debank', 'all-history', account],
        queryFn: async ({ pageParam }) => {
            return DeBankHistory.getAllTransactions(account, { indicator: pageParam })
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    })
    const data = result.data
    const transactions = useMemo(
        () =>
            data?.pages
                .flatMap((p) => p.data)
                .filter((transaction) => !hidingScamSettings.value || !transaction.isScam) || EMPTY_LIST,
        [data?.pages],
    )

    const networks = useNetworks()

    const { Transaction } = useWeb3State()
    // TODO invalidQueries after sending transitions
    const queries = useQueries({
        queries: networks.map((network) => {
            return {
                enabled: !!account && (transactions.length > 0 || !result.isLoading),
                queryKey: ['transitions', network.chainId, account],
                queryFn: async () => {
                    return Transaction?.getTransactions?.(network.chainId, account) ?? []
                },
            }
        }),
    })
    useEffect(() => {
        return Transaction?.transactions?.subscribe(() => {
            queryClient.invalidateQueries({ queryKey: ['transitions'] })
        })
    }, [])

    const allLocaleTxes = useMemo(() => {
        return queries.flatMap((x) => x.data ?? []) as Array<RecentTransaction<ChainId, EvmTransaction>>
    }, [queries])

    // Some are already in debank history
    const localeTxes = useMemo(() => {
        const now = Date.now()
        const duration = 1800_000
        return sortBy(
            allLocaleTxes.filter((tx) => {
                // show txes from the past half txes
                return !transactions.find((x) => x.id === tx.id) && now - tx.updatedAt.getTime() < duration
            }),
            (x) => -x.createdAt.getTime(),
        )
    }, [allLocaleTxes, transactions])

    return {
        ...result,
        data: transactions,
        localeTxes,
    }
}
