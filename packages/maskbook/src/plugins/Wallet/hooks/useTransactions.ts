import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'
import type { TransactionProvider } from '../types'

export function useTransactions(address: string, provider: TransactionProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return WalletRPC.getTransactionList(address.toLowerCase(), provider)
    }, [address, provider])
}
