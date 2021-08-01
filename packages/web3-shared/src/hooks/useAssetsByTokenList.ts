import type { FungibleTokenDetailed } from '../types'
import { useAssetsFromChain } from './useAssetsFromChain'
import { useAssetsFromProvider } from './useAssetsFromProvider'
import { useCallback } from 'react'
import { isSameAddress, makeSortAssertFn } from '../utils'
import { useChainId } from './useChainId'

export function useAssetsByTokenList(tokens: FungibleTokenDetailed[]) {
    const chainId = useChainId()

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
        retry: retryAssetsDetailedChain,
    } = useAssetsFromChain(tokens)

    const {
        value: assetsDetailedProvider = [],
        loading: assetsDetailedProviderLoading,
        error: assetsDetailedProviderError,
        retry: retryAssetsDetailedDebank,
    } = useAssetsFromProvider()

    const detailedTokensRetry = useCallback(() => {
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryAssetsDetailedChain, retryAssetsDetailedDebank])

    const assetsDetailed = assetsDetailedChain
        .map((asset) => {
            const assertWithValue = assetsDetailedProvider.find((detail) =>
                isSameAddress(detail.token.address, asset.token.address),
            )
            if (assertWithValue) {
                return { ...asset, ...{ value: assertWithValue.value } }
            }
            return asset
        })
        .sort(makeSortAssertFn(chainId, { isMaskBoost: true }))

    return {
        value: assetsDetailed,
        error: assetsDetailedChainError || assetsDetailedProviderError,
        loading: assetsDetailedChainLoading || assetsDetailedProviderLoading,
        retry: detailedTokensRetry,
    }
}
