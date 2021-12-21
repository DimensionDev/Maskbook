import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { ChainId, NonFungibleAssetProvider, ERC721TokenCollectionInfo } from '../types'
import { useWeb3Context } from '../context'

export function useCollections(
    chainId: ChainId,
    address: string,
    provider: NonFungibleAssetProvider,
    page: number,
    size: number,
): AsyncStateRetry<{
    collections: ERC721TokenCollectionInfo[]
    hasNextPage: boolean
}> {
    const { getCollectionsNFT } = useWeb3Context()

    return useAsyncRetry(async () => {
        if (!address) {
            return {
                collections: [],
                hasNextPage: false,
            }
        }
        return getCollectionsNFT(chainId, address.toLowerCase(), provider, page, size)
    }, [address, provider, page, chainId])
}
