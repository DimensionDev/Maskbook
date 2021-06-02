import type { FungibleTokenDetailed } from '@dimensiondev/web3-shared'
import { useNativeTokenDetailed, useWallet } from '@dimensiondev/web3-shared'
import { useCallback } from 'react'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { useAssetsMerged, useAssetsFromProvider, useAssetsFromChain } from '.'

export function useAssets(tokens: FungibleTokenDetailed[]) {
    const wallet = useWallet()
    const {
        value: nativeTokenDetailed,
        loading: nativeTokenDetailedLoading,
        error: nativeTokenDetailedError,
        retry: retryNativeTokenDetailed,
    } = useNativeTokenDetailed()

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
    } = useAssetsFromProvider()

    const detailedTokensRetry = useCallback(() => {
        retryNativeTokenDetailed()
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryNativeTokenDetailed, retryAssetsDetailedChain, retryAssetsDetailedDebank])

    const assetsDetailed = useAssetsMerged(assetsDetailedProvider, assetsDetailedChain)

    return {
        value: assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatEthereumAddress(x.token.address))),
        error: nativeTokenDetailedError || assetsDetailedChainError || assetsDetailedProviderError,
        loading: nativeTokenDetailedLoading || assetsDetailedChainLoading || assetsDetailedProviderLoading,
        retry: detailedTokensRetry,
    }
}
