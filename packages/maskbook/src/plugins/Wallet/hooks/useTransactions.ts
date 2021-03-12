import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'
import type { TransactionProvider } from '../types'

export function useTransactions(address: string, provider: TransactionProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return WalletRPC.getTransactionList('0x9972d940c9a23f84fcf92867d18f28d75d010e5e'.toLowerCase(), provider)
    }, [address, provider])
}
