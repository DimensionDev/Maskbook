import { useWeb3Context, useWeb3State } from '../context'
import { useAsyncRetry } from 'react-use'
import { PortfolioProvider } from '../types'
import { unreachable } from '@dimensiondev/kit'

export function useTransactions(address: string, page?: number, size?: number) {
    const { getTransactionList } = useWeb3Context()
    const { portfolioProvider } = useWeb3State()

    return useAsyncRetry(async () => {
        if (!address) {
            return {
                transactions: [],
                hasNextPage: false,
            }
        }

        switch (portfolioProvider) {
            case PortfolioProvider.DEBANK:
                return getTransactionList(address.toLowerCase(), portfolioProvider, page, size)
            case PortfolioProvider.ZERION:
                return getTransactionList(address.toLowerCase(), portfolioProvider, page, size)
            default:
                unreachable(portfolioProvider)
        }
    }, [address, portfolioProvider, page, size])
}
