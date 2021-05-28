import { useAsyncRetry } from 'react-use'
import { useAccount } from '@dimensiondev/web3-shared'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'

/**
 * Fetch tokens detailed info from portfolio data provider
 */
export function useAssetsFromProvider() {
    const account = useAccount()
    const provider = useValueRef(currentPortfolioDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!account) return []
        return WalletRPC.getAssetsList(account.toLowerCase(), provider)
    }, [account, provider])
}
