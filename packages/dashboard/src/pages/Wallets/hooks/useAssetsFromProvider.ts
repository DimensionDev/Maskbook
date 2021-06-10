import { useAccount, useChainDetailed } from '@dimensiondev/web3-shared'
import { useCurrentPortfolioDataProvider } from '../api'
import { useAsyncRetry } from 'react-use'
import { PluginServices } from '../../../API'

export function useAssetsFromProvider() {
    const account = useAccount()
    const chainDetailed = useChainDetailed()
    const provider = useCurrentPortfolioDataProvider()
    return useAsyncRetry(async () => {
        if (!account) return []
        if (chainDetailed?.network !== 'mainnet') return []
        return PluginServices.Wallet.getAssetsList(account.toLowerCase(), provider)
    }, [account, provider])
}
