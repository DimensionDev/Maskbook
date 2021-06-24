import type { CollectibleProvider, ERC1155TokenAssetDetailed, ERC721TokenAssetDetailed } from '../types'
import { useChainId } from './useChainId'
import { useAsyncRetry } from 'react-use'
import { useWeb3Context } from '../context'
import { uniqWith } from 'lodash-es'
import { isSameAddress } from '../utils'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export function useCollectibles(
    address: string,
    provider: CollectibleProvider,
    page: number,
    size: number,
): AsyncStateRetry<{
    collectibles: (ERC721TokenAssetDetailed | ERC1155TokenAssetDetailed)[]
    hasNextPage: boolean
}> {
    const chainId = useChainId()
    const { getAssetsListNFT, getERC721TokensPaged } = useWeb3Context()
    return useAsyncRetry(async () => {
        if (!address) {
            return {
                collectibles: [],
                hasNextPage: false,
            }
        }

        // a list of mock data address:
        // 0x3c6137504c38215fea30605b3e364a23c1d3e14f
        // 0x65c1b9ae4e4d8dcccfd3dc41b940840fe8570f2a
        // 0xa357a589a37cf7b6edb31b707e8ed3219c8249ac
        const result = await getAssetsListNFT(address.toLowerCase(), chainId, provider, page, size)
        const erc721Tokens = await getERC721TokensPaged(page, size)

        return {
            collectibles: uniqWith(
                [...result.assets, ...erc721Tokens],
                (a, b) => isSameAddress(a.address, b.address) && a.tokenId === b.tokenId,
            ),
            hasNextPage: result.hasNextPage,
        }
    }, [address, provider, page])
}
