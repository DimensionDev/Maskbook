import { useValueRef } from '@masknet/shared'
import { unreachable } from '@dimensiondev/kit'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'
import { PortfolioProvider, Transaction } from '../types'

export function useTransactions(
    address: string,
    page?: number,
): AsyncStateRetry<{ transactions: Transaction[]; hasNextPage: boolean }> {
    const provider = useValueRef(currentPortfolioDataProviderSettings)

    return useAsyncRetry(async () => {
        if (!address)
            return {
                transactions: [],
                hasNextPage: false,
            }

        switch (provider) {
            case PortfolioProvider.DEBANK:
                return WalletRPC.getTransactionList(address.toLowerCase(), provider, page)

            case PortfolioProvider.ZERION:
                return await WalletRPC.getTransactionList(address.toLowerCase(), provider, page)

            default:
                unreachable(provider)
        }
    }, [address, provider, page])
}
