import { useCallback } from 'react'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { FungibleTokenDetailed, useNativeTokenDetailed } from '@dimensiondev/web3-shared'
import { useAssetsFromProvider } from './useAssetsFromProvider'
import { useAssetsFromChain } from './useAssetsFromChain'
import { useAssetsMerged } from './useAssetsMerged'
import { useWallet } from './useWallet'

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
    console.log({ assetsDetailedProvider })
    const detailedTokensRetry = useCallback(() => {
        retryNativeTokenDetailed()
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryNativeTokenDetailed, retryAssetsDetailedChain, retryAssetsDetailedDebank])

    // should place debank detailed tokens at the first place
    // it prevents them from replacing by previous detailed tokens because the uniq algorithm
    const assetsDetailed = useAssetsMerged(assetsDetailedProvider, assetsDetailedChain)

    // filter out tokens in blacklist
    return {
        value: assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatEthereumAddress(x.token.address))),
        error: nativeTokenDetailedError || assetsDetailedChainError || assetsDetailedProviderError,
        loading: nativeTokenDetailedLoading || assetsDetailedChainLoading || assetsDetailedProviderLoading,
        retry: detailedTokensRetry,
    }
}
