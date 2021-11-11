import type { ChainId, FungibleTokenDetailed } from '../types'
import { useWallet } from './useWallet'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'
import { useAssetsFromChain } from './useAssetsFromChain'
import { useAssetsFromProvider } from './useAssetsFromProvider'
import { useCallback } from 'react'
import { useAssetsMerged } from './useAssetsMerged'
import { formatEthereumAddress } from '../utils'

export function useAssets(tokens: FungibleTokenDetailed[], chainId?: ChainId | 'all') {
    const wallet = useWallet()
    const {
        value: nativeTokenDetailed,
        loading: nativeTokenDetailedLoading,
        error: nativeTokenDetailedError,
        retry: retryNativeTokenDetailed,
    } = useNativeTokenDetailed(chainId === 'all' ? undefined : chainId)

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
        retry: retryAssetsDetailedChain,
    } = useAssetsFromChain(
        nativeTokenDetailed && !nativeTokenDetailedLoading ? [nativeTokenDetailed, ...tokens] : tokens,
    )

    const {
        value: assetsDetailedProvider = [],
        loading: assetsDetailedProviderLoading,
        error: assetsDetailedProviderError,
        retry: retryAssetsDetailedDebank,
    } = useAssetsFromProvider(chainId)

    const detailedTokensRetry = useCallback(() => {
        retryNativeTokenDetailed()
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryNativeTokenDetailed, retryAssetsDetailedChain, retryAssetsDetailedDebank])

    const assetsDetailed = useAssetsMerged(
        assetsDetailedProvider,
        assetsDetailedChain.filter((x) => !chainId || chainId === 'all' || x.token.chainId === chainId),
    )

    return {
        value: assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatEthereumAddress(x.token.address))),
        error: nativeTokenDetailedError || assetsDetailedChainError || assetsDetailedProviderError,
        loading: nativeTokenDetailedLoading || assetsDetailedChainLoading || assetsDetailedProviderLoading,
        retry: detailedTokensRetry,
    }
}
