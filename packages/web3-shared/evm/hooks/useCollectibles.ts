import { ChainId, CollectibleProvider, ERC721TokenDetailed } from '../types'
import { useAsyncRetry } from 'react-use'
import { useWeb3Context } from '../context'
import { uniqWith } from 'lodash-es'
import { isSameAddress } from '../utils'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export function useCollectibles(
    address: string,
    chainId: ChainId | null,
    provider: CollectibleProvider,
    page: number,
    size: number,
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

        const result = await getAssetsListNFT(address.toLowerCase(), chainId ?? ChainId.Mainnet, provider, page, size)
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
