import { useAsyncRetry } from 'react-use'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'
import { useRef } from 'react'
import { PortfolioProvider, Transaction } from '../types'
import { unreachable } from '../../../utils/utils'

export function useTransactions(address: string, page?: number) {
    const values = useRef<Transaction[]>([])
    const provider = useValueRef(currentPortfolioDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!address) return []
        if (page === 1) values.current = []

        switch (provider) {
            case PortfolioProvider.DEBANK:
                const result = await WalletRPC.getTransactionList(address.toLowerCase(), provider, page)
                values.current.push(...result)
                break
            case PortfolioProvider.ZERION:
                const response = await WalletRPC.getTransactionList(address.toLowerCase(), provider, page)
                values.current.push(...response)
                break
            default:
                unreachable(provider)
        }

        return values.current
    }, [address, provider, page])
}
