import { useAsyncRetry } from 'react-use'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'
import { useRef } from 'react'
import { PortfolioProvider, Transaction } from '../types'

export function useTransactions(address: string, page?: number) {
    const values = useRef<Transaction[]>([])
    const provider = useValueRef(currentPortfolioDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!address) return []
        if (page === 1) values.current = []

        if (provider === PortfolioProvider.ZERION) {
            const result = await WalletRPC.getTransactionList(address.toLowerCase(), provider, page)
            values.current.push(...result)
        } else {
            values.current = await WalletRPC.getTransactionList(address.toLowerCase(), provider)
        }

        return values.current
    }, [address, provider, page])
}
