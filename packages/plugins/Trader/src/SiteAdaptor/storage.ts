import type { ScopedStorage } from '@masknet/shared-base'
import { OKX } from '@masknet/web3-providers'
import { useEffect } from 'react'
import { useSubscription } from 'use-subscription'
import type { OkxSwapTransaction } from '../types/trader.js'

export interface StorageOptions {
    walletBindings: Record<string, string>
    transactions: OkxSwapTransaction[]
}
let storage: ScopedStorage<StorageOptions>

export function setupStorage(initialized: ScopedStorage<StorageOptions>) {
    storage = initialized
}

export function useWalletId(address: string): string | undefined {
    const value = useSubscription(storage?.storage?.walletBindings?.subscription)
    const key = address.toLowerCase()
    useEffect(() => {
        if (!key) return
        const ac = new AbortController()
        storage?.storage.walletBindings.initializedPromise.then(async () => {
            const walletId = storage?.storage.walletBindings.value[key]
            if (!walletId) {
                const newWalletId = await OKX.createWallet(address)
                if (newWalletId && !ac.signal.aborted) await recordBinding(key, newWalletId)
            }
        })
        return () => ac.abort()
    }, [key])

    return key ? value[key] : undefined
}

export async function recordBinding(address: string, walletId: string) {
    const bindings = storage?.storage.walletBindings
    await bindings.initializedPromise
    await bindings.setValue({
        ...bindings.value,
        [address.toLowerCase()]: walletId,
    })
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
