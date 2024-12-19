import { EMPTY_LIST, hidingScamSettings, type PageIndicator } from '@masknet/shared-base'
import { useChainContext, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { DeBankHistory } from '@masknet/web3-providers'
import { type RecentTransaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction as EvmTransaction } from '@masknet/web3-shared-evm'
import { useInfiniteQuery, useQueries, useQueryClient } from '@tanstack/react-query'
import { sortBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'

/**
 * Get locale transitions and merge them with ones from debank history.
 * Transactions from debank are fetching page by page.
 */
export function useTransactions() {
    const { account } = useChainContext()
    const response = useInfiniteQuery({
        queryKey: ['debank', 'all-history', account],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn: async ({ pageParam }) => {
            return DeBankHistory.getAllTransactions(account, { indicator: pageParam })
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator as PageIndicator | undefined,
        select: (data) =>
            data.pages.flatMap((page) => page.data).filter((t) => !hidingScamSettings.value || !t.isScam) || EMPTY_LIST,
    })

    const networks = useNetworks()

    const { Transaction } = useWeb3State()
    // TODO invalidQueries after sending transitions
    const queries = useQueries({
        queries: networks.map((network) => {
            return {
                enabled: !!account && ((response.data?.length || 0) > 0 || !response.isPending),
                queryKey: ['transitions', network.chainId, account],
                queryFn: async () => {
                    return Transaction?.getTransactions?.(network.chainId, account) ?? []
                },
            }
        }),
    })
    const queryClient = useQueryClient()
    useEffect(() => {
        return Transaction?.transactions?.subscribe(() => {
            queryClient.invalidateQueries({ queryKey: ['transitions'] })
        })
    }, [queryClient])

    const allLocaleTxes = useMemo(() => {
        return queries.flatMap((x) => x.data ?? []) as Array<RecentTransaction<ChainId, EvmTransaction>>
        // eslint-disable-next-line @tanstack/query/no-unstable-deps
    }, [queries])

    // Some are already in debank history
    const localeTxes = useMemo(() => {
        const now = Date.now()
        const duration = 1800_000
        return sortBy(
            allLocaleTxes.filter((tx) => {
                // show txes from the past half txes
                return !response.data?.find((x) => x.id === tx.id) && now - tx.updatedAt.getTime() < duration
            }),
            (x) => -x.createdAt.getTime(),
        )
    }, [allLocaleTxes, response.data])

    return [{ transactions: response.data, localeTxes }, response] as const
}
