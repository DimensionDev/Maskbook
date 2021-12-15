import type { ChainId, FungibleTokenDetailed } from '../types'
import { useWallet } from './useWallet'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'
import { useAssetsFromChain } from './useAssetsFromChain'
import { useAssetsFromProvider } from './useAssetsFromProvider'
import { useCallback, useMemo } from 'react'
import { useAssetsMerged } from './useAssetsMerged'
import { formatEthereumAddress } from '../utils'

const EMPTY_LIST: never[] = []
export function useAssets(tokens: FungibleTokenDetailed[], chainId?: ChainId | 'all') {
    const wallet = useWallet()
    const {
        value: nativeTokenDetailed,
        loading: nativeTokenDetailedLoading,
        error: nativeTokenDetailedError,
        retry: retryNativeTokenDetailed,
    } = useNativeTokenDetailed(chainId === 'all' ? undefined : chainId)

    const {
        value: assetsFromChain = EMPTY_LIST,
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
        retry: retryAssetsDetailedChain,
    } = useAssetsFromChain(nativeTokenDetailed ? [nativeTokenDetailed, ...tokens] : tokens)

    const {
        value: assetsFromProvider = EMPTY_LIST,
        loading: assetsDetailedProviderLoading,
        error: assetsDetailedProviderError,
        retry: retryAssetsDetailedDebank,
    } = useAssetsFromProvider(chainId)

    const detailedTokensRetry = useCallback(() => {
        retryNativeTokenDetailed()
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryNativeTokenDetailed, retryAssetsDetailedChain, retryAssetsDetailedDebank])

    const matchedAssetsFromChain = useMemo(
        () => assetsFromChain.filter((x) => !chainId || chainId === 'all' || x.token.chainId === chainId),
        [assetsFromChain, chainId],
    )
    const assetsDetailed = useAssetsMerged(assetsFromProvider, matchedAssetsFromChain)

    const assets = useMemo(
        () => assetsDetailed.filter((x) => !wallet?.erc20_token_blacklist.has(formatEthereumAddress(x.token.address))),
        [assetsDetailed, wallet?.erc20_token_blacklist],
    )

    return {
        value: assets,
        error: nativeTokenDetailedError || assetsDetailedChainError || assetsDetailedProviderError,
        loading: nativeTokenDetailedLoading || assetsDetailedChainLoading || assetsDetailedProviderLoading,
        retry: detailedTokensRetry,
    }
}
