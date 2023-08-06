import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useAccount, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { DeBankHistory } from '@masknet/web3-providers'
import { TransactionStatusType, type RecentTransaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction as EvmTransaction } from '@masknet/web3-shared-evm'
import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

/**
 * Get locale transitions and merge them with ones from debank history.
 * Transactions from debank are fetching page by page.
 */
export function useTransactions() {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const result = useInfiniteQuery({
        queryKey: ['debank', 'all-history', account],
        queryFn: async ({ pageParam }) => {
            return DeBankHistory.getAllTransactions(account, { indicator: pageParam })
        },
        getNextPageParam: (lastPage) => lastPage.nextIndicator,
    })

    const networks = useNetworks()

    const { Transaction } = useWeb3State()
    const queries = useQueries({
        queries: networks.map((network) => {
            return {
                enabled: !!account,
                queryKey: ['transitions', network, account],
                queryFn: async () => {
                    return Transaction?.getTransactions?.(network.chainId, account) ?? []
                },
            }
        }),
    })
    const localeTxes = useMemo(() => {
        return queries.flatMap((x) => x.data ?? []) as Array<RecentTransaction<ChainId, EvmTransaction>>
    }, [queries])

    localeTxes.filter((x) => x.status !== TransactionStatusType.SUCCEED)
    const localeTxMap = useMemo(() => {
        return Object.fromEntries(
            localeTxes.map((x) => {
                return [x.id, x]
            }),
        )
    }, [localeTxes])
    const data = result.data
    const transactions = useMemo(() => data?.pages.flatMap((p) => p.data) || EMPTY_LIST, [data?.pages])
    const merged = transactions
    return { ...result, data: merged, localeTxes, localeTxMap }
}
