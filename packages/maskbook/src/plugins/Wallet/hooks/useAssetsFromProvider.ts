import { useAsyncRetry } from 'react-use'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainId'
import { WalletRPC } from '../messages'
import { currentPortfolioDataProviderSettings } from '../settings'

/**
 * Fetch tokens detailed info from portfolio data provider
 */
export function useAssetsFromProvider() {
    const account = useAccount()
    const chainId = useChainId()
    const provider = useValueRef(currentPortfolioDataProviderSettings)
    return useAsyncRetry(async () => {
        if (!account) return []
        return WalletRPC.getAssetsList(account.toLowerCase(), chainId, provider)
    }, [account, chainId, provider])
}
