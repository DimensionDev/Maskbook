import type { ScopedStorage } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'
import type { OkxSwapTransaction } from '../types/trader.js'

export interface StorageOptions {
    transactions: OkxSwapTransaction[]
}
let storage: ScopedStorage<StorageOptions>

export function setupStorage(initialized: ScopedStorage<StorageOptions>) {
    storage = initialized
}

export function useSwapHistory() {
    const txes = useSubscription(storage?.storage?.transactions?.subscription)
    return txes
}

export async function addTransaction(transaction: OkxSwapTransaction) {
    if (!storage?.storage?.transactions) return
    const transactions = storage.storage.transactions
    await transactions.initializedPromise
    transactions.setValue([...transactions.value, transaction])
}

export async function updateTransaction(
    txId: string,
    transaction: Partial<OkxSwapTransaction> | ((tx: OkxSwapTransaction) => OkxSwapTransaction),
) {
    if (!storage?.storage?.transactions) return
    const transactions = storage.storage.transactions
    await transactions.initializedPromise
    transactions.setValue(
        transactions.value.map((tx) => {
            if (tx.hash !== txId) return tx
            return typeof transaction === 'function' ? transaction(tx) : { ...tx, ...transaction }
        }),
    )
}

export function useTransaction(hash: string | null) {
    const txes = useSwapHistory()
    return hash ? txes.find((x) => x.hash === hash) : null
}
