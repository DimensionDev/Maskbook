import { useAsyncRetry } from 'react-use'
import { uniqWith } from 'lodash-unified'
import { useWeb3Context } from '../context'
import type { ChainId, NonFungibleAssetProvider, ERC721TokenDetailed } from '../types'
import { isSameAddress } from '../utils'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export function useCollectibles(
    chainId: ChainId,
    address: string,
    provider: NonFungibleAssetProvider,
    page: number,
    size: number,
    collection?: string,
): AsyncStateRetry<{
    collectibles: ERC721TokenDetailed[]
    hasNextPage: boolean
}> {
    const { getAssetsListNFT, erc721Tokens } = useWeb3Context()

    return useAsyncRetry(async () => {
        if (!address) {
            return {
                collectibles: [],
                hasNextPage: false,
            }
        }

        const result = await getAssetsListNFT(chainId, address.toLowerCase(), provider, page, size, collection)
        return {
            collectibles: uniqWith(
                [
                    ...result.assets,
                    ...erc721Tokens.getCurrentValue().filter((x) => !chainId || x.contractDetailed.chainId === chainId),
                ],
                (a, b) =>
                    isSameAddress(a.contractDetailed.address, b.contractDetailed.address) && a.tokenId === b.tokenId,
            ),
            hasNextPage: result.hasNextPage,
        }
    }, [address, provider, page, erc721Tokens, chainId])
}
