import { useAsyncRetry } from 'react-use'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'

export function useTransactions(address: string) {
    const provider = useValueRef(currentPortfolioDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!address) return []
        return WalletRPC.getTransactionList(address.toLowerCase(), provider)
    }, [address, provider])
}
