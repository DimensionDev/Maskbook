import type { FungibleTokenDetailed, ChainId } from '../types'
import { useAssetsFromChain } from './useAssetsFromChain'
import { useAssetsFromProvider } from './useAssetsFromProvider'
import { useCallback, useEffect, useState } from 'react'
import { isSameAddress } from '../utils'
import { sortBy, uniqBy } from 'lodash-unified'

export function useAssetsByTokenList(tokens: FungibleTokenDetailed[], targetChainId?: ChainId) {
    const [tokensForAsset, setTokensForAsset] = useState<FungibleTokenDetailed[]>([])

    // merge tokens to avoid fetch asset from chain all the time
    useEffect(() => {
        setTokensForAsset((oldTokensForAsset) => {
            const uniqTokens = uniqBy([...tokens, ...oldTokensForAsset], (x) => x.address)
            return sortBy(uniqTokens, (x) => x.address)
        })
    }, [tokens.map((x) => x.address.slice(0, 5)).join('')])

    const {
        value: assetsDetailedChain = [],
        loading: assetsDetailedChainLoading,
        error: assetsDetailedChainError,
        retry: retryAssetsDetailedChain,
    } = useAssetsFromChain(tokensForAsset, targetChainId)

    const {
        value: assetsDetailedProvider = [],
        loading: assetsDetailedProviderLoading,
        error: assetsDetailedProviderError,
        retry: retryAssetsDetailedDebank,
    } = useAssetsFromProvider(targetChainId)

    const detailedTokensRetry = useCallback(() => {
        retryAssetsDetailedChain()
        retryAssetsDetailedDebank()
    }, [retryAssetsDetailedChain, retryAssetsDetailedDebank])

    const assetsDetailed = assetsDetailedChain
        .map((asset) => {
            const assertWithValue = assetsDetailedProvider.find(
                (detail) =>
                    isSameAddress(detail.token.address, asset.token.address) &&
                    detail.token.chainId === asset.token.chainId,
            )
            if (assertWithValue) {
                return { ...asset, ...{ value: assertWithValue.value } }
            }
            return asset
        })
        .filter((m) => tokens.find((x) => isSameAddress(x.address, m.token.address)))

    return {
        value: assetsDetailed,
        error: assetsDetailedChainError || assetsDetailedProviderError,
        loading: assetsDetailedChainLoading || assetsDetailedProviderLoading,
        retry: detailedTokensRetry,
    }
}
