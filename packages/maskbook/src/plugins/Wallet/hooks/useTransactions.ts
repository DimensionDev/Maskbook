import { useAsyncRetry } from 'react-use'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'
import { useRef } from 'react'
import type { Transaction } from '../types'

export function useTransactions(address: string, page?: number) {
    const values = useRef<Transaction[]>([])
    const provider = useValueRef(currentPortfolioDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!address) return []
        const result = await WalletRPC.getTransactionList(address.toLowerCase(), provider, page)
        values.current.push(...result)

        return values.current
    }, [address, provider, page])
}
