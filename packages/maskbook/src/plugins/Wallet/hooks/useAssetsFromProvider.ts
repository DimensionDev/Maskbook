import { useAsyncRetry } from 'react-use'
import { useAccount, useChainDetailed } from '@dimensiondev/web3-shared'
import { useValueRef } from '@dimensiondev/maskbook-shared'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'

/**
 * Fetch tokens detailed info from portfolio data provider
 */
export function useAssetsFromProvider() {
    const account = useAccount()
    const chainDetailed = useChainDetailed()
    const provider = useValueRef(currentPortfolioDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!account) return []
        if (chainDetailed?.network !== 'mainnet') return []
        return WalletRPC.getAssetsList(account.toLowerCase(), provider)
    }, [account, provider, chainDetailed?.network])
}
