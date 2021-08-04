import { useValueRef } from '@masknet/shared'
import { getNetworkTypeFromChainId, useChainId, PortfolioProvider } from '@masknet/web3-shared'
import { unreachable } from '@dimensiondev/kit'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'
import type { Transaction } from '../types'

export function useTransactions(
    address: string,
    page?: number,
): AsyncStateRetry<{ transactions: Transaction[]; hasNextPage: boolean }> {
    const chainId = useChainId()
    const provider = useValueRef(currentPortfolioDataProviderSettings)

    return useAsyncRetry(async () => {
        const network = getNetworkTypeFromChainId(chainId)

        if (!address || !network)
            return {
                transactions: [],
                hasNextPage: false,
            }

        switch (provider) {
            case PortfolioProvider.DEBANK:
            case PortfolioProvider.ZERION:
                return WalletRPC.getTransactionList(address.toLowerCase(), network, provider, page)
            default:
                unreachable(provider)
        }
    }, [address, chainId, provider, page])
}
