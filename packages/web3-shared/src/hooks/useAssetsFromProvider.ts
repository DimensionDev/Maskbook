import { useAccount } from './useAccount'
import { useChainDetailed } from './useChainDetailed'
import { useWeb3Context, useWeb3State } from '../context'
import { useAsyncRetry } from 'react-use'
import { useNetworkType } from './useNetworkType'

export function useAssetsFromProvider() {
    const { getAssetList } = useWeb3Context()
    const { portfolioProvider } = useWeb3State()
    const account = useAccount()
    const network = useNetworkType()
    const chainDetailed = useChainDetailed()

    return useAsyncRetry(async () => {
        if (!account) return []
        if (chainDetailed?.network !== 'mainnet') return []
        return getAssetList(account.toLowerCase(), network, portfolioProvider)
    }, [account, network, portfolioProvider, chainDetailed])
}
