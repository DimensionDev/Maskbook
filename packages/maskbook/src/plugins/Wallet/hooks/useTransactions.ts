import { useAsyncRetry } from 'react-use'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { WalletRPC } from '../messages'
import { currentTransactionDataProviderSettings } from '../settings'

export function useTransactions(address: string) {
    const provider = useValueRef(currentTransactionDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!address) return []
        return WalletRPC.getTransactionList(address.toLowerCase(), provider)
    }, [address, provider])
}
