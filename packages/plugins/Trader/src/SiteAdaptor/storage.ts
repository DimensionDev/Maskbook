import { EMPTY_LIST, type ScopedStorage } from '@masknet/shared-base'
import { sortBy } from 'lodash-es'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import type { OkxTransaction } from '../types/trader.js'

export interface StorageOptions {
    /** isolated by wallet */
    transactions: Record<string, OkxTransaction[]>
}
let storage: ScopedStorage<StorageOptions>

export function setupStorage(initialized: ScopedStorage<StorageOptions>) {
    storage = initialized
}

export function useSwapHistory(address: string) {
    const txes = useSubscription(storage?.storage?.transactions?.subscription)
    const addr = address.toLowerCase()
    return useMemo(() => {
        return sortBy(txes[addr], (x) => -x.timestamp) || EMPTY_LIST
    }, [txes, addr])
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
    const txes = useSwapHistory(address)
    return hash ? txes.find((x) => x.hash === hash) : null
}
