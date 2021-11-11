import type { ChainId, FungibleTokenDetailed } from '../types'
import { useWallet } from './useWallet'
import { useAssetsFromChain } from './useAssetsFromChain'
import { useAssetsFromProvider } from './useAssetsFromProvider'
import { useCallback } from 'react'
import { useAssetsMerged } from './useAssetsMerged'
import { createNativeToken, formatEthereumAddress } from '../utils'
import { useChainId } from './useChainId'

export function useAssets(tokens: FungibleTokenDetailed[], chainId?: ChainId | 'all') {
    const wallet = useWallet()
    const currentChainId = useChainId()
    const nativeTokenDetailed = chainId === 'all' ? null : createNativeToken(chainId ?? currentChainId)

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
        retry: retryAssetsDetailedChain,
    } = useAssetsFromChain(nativeTokenDetailed ? [nativeTokenDetailed, ...tokens] : tokens)

    const {
        value: assetsDetailedProvider = [],
        loading: assetsDetailedProviderLoading,
        error: assetsDetailedProviderError,
        retry: retryAssetsDetailedDebank,
    } = useAssetsFromProvider(chainId)

    const detailedTokensRetry = useCallback(() => {
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryAssetsDetailedChain, retryAssetsDetailedDebank])

    const assetsDetailed = useAssetsMerged(
        assetsDetailedProvider,
        assetsDetailedChain.filter((x) => !chainId || chainId === 'all' || x.token.chainId === chainId),
    )

    return {
        value: assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatEthereumAddress(x.token.address))),
        error: assetsDetailedChainError || assetsDetailedProviderError,
        loading: assetsDetailedChainLoading || assetsDetailedProviderLoading,
        retry: detailedTokensRetry,
    }
}
