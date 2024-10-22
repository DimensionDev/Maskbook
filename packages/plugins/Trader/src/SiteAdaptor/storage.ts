import { EMPTY_LIST, type ScopedStorage } from '@masknet/shared-base'
import { sortBy } from 'lodash-es'
import type { OkxTransaction } from '../types/trader.js'
import { useQuery } from '@tanstack/react-query'

export interface StorageOptions {
    /** isolated by wallet */
    transactions: Record<string, OkxTransaction[]>
}
let storage: ScopedStorage<StorageOptions>

export function setupStorage(initialized: ScopedStorage<StorageOptions>) {
    storage = initialized
}

export function useTradeHistory(address: string) {
    return useQuery({
        enabled: storage.storage.transactions.initialized,
        queryKey: ['trade-history', address],
        refetchOnMount: 'always',
        queryFn: async () => {
            return storage.storage.transactions.value
        },
        select(data) {
            const addr = address.toLowerCase()
            return sortBy(data[addr], (x) => -x.timestamp) || EMPTY_LIST
        },
    })
}

export async function addTransaction<T extends OkxTransaction>(address: string, transaction: T) {
    if (!storage?.storage?.transactions) return
    const txObject = storage.storage.transactions
    await txObject.initializedPromise
    const addr = address.toLowerCase()
    const transactions = txObject.value[addr] || []
    txObject.setValue({
        ...txObject.value,
        [addr]: [...transactions, transaction],
    })
}

export async function updateTransaction<T extends OkxTransaction>(
    address: string,
    txId: string,
    transaction: Partial<T> | ((tx: T) => T),
) {
    if (!storage?.storage?.transactions) return
    const txesObject = storage.storage.transactions

    await txesObject.initializedPromise
    const addr = address.toLowerCase()
    const transactions = txesObject.value[addr] || []
    txesObject.setValue({
        ...txesObject.value,
        [addr]: transactions.map((tx) => {
            if (tx.hash !== txId) return tx
            return typeof transaction === 'function' ? transaction(tx as T) : { ...tx, ...transaction }
        }),
    })
}

export function useTransaction(address: string, hash: string | null) {
    const { data: txes = [] } = useTradeHistory(address)
    return hash ? txes.find((x) => x.hash === hash) : null
}
