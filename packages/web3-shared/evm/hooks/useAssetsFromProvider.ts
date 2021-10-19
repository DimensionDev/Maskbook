import { useWeb3Context, useWeb3State } from '../context'
import { useAsyncRetry } from 'react-use'
import { useChainDetailed } from './useChainDetailed'
import { useNetworkType } from './useNetworkType'
import { getNetworkTypeFromChainId } from '../utils'
import type { ChainId } from '../types'
import { useAccount } from './useAccount'

export function useAssetsFromProvider(chainId?: ChainId | 'all') {
    const { getAssetsList: getAssetList } = useWeb3Context()
    const { portfolioProvider } = useWeb3State()
    const account = useAccount()
    const network = useNetworkType()
    const chainDetailed = useChainDetailed()

    return useAsyncRetry(async () => {
        if (!account) return []
        if (chainDetailed?.network !== 'mainnet') return []
        if (!chainId && getNetworkTypeFromChainId(chainDetailed.chainId) !== network) return []
        const networkType =
            chainId === undefined ? network : chainId === 'all' ? undefined : getNetworkTypeFromChainId(chainId)

        return getAssetList(account.toLowerCase(), portfolioProvider, networkType)
    }, [account, portfolioProvider, network, chainDetailed, chainId])
}
