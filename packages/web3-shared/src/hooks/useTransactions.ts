import { useWeb3Context, useWeb3State } from '../context'
import { useAsyncRetry } from 'react-use'
import { ChainId, PortfolioProvider } from '../types'
import { unreachable } from '@dimensiondev/kit'
import { getNetworkTypeFromChainId } from '../utils'

export function useTransactions(address: string, page?: number, size?: number, chainId?: ChainId) {
    const { getTransactionList } = useWeb3Context()
    const { portfolioProvider, chainId: currentChainId } = useWeb3State()

    return useAsyncRetry(async () => {
        const network = getNetworkTypeFromChainId(chainId || currentChainId)

        if (!address || !network) {
            return {
                transactions: [],
                hasNextPage: false,
            }
        }

        switch (portfolioProvider) {
            case PortfolioProvider.DEBANK:
            case PortfolioProvider.ZERION:
                return getTransactionList(address.toLowerCase(), network, portfolioProvider, page, size)
            default:
                unreachable(portfolioProvider)
        }
    }, [address, chainId, portfolioProvider, page, size])
}
