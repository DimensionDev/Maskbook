import type { ERC721TokenDetailed } from '../types'
import { useAsyncRetry } from 'react-use'
import { useWeb3Context } from '../context'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

/*
 display custom collection first, then display collection which from OpenSea
*/
export function useCollectiblesPaged(
    page: number,
    size: number,
): AsyncStateRetry<{
    collectibles: ERC721TokenDetailed[]
    hasNextPage: boolean
}> {
    const { getERC721TokensPaged } = useWeb3Context()
    return useAsyncRetry(async () => {
        const erc721Tokens = await getERC721TokensPaged(page, size)

        console.log(erc721Tokens.length)

        if (erc721Tokens.length < size) {
            // query from opensea
            const offset = size - erc721Tokens.length + page * size

            return {
                collectibles: [],
                hasNextPage: true,
            }
        } else {
            // remove duplication
            return {
                collectibles: erc721Tokens,
                hasNextPage: true,
            }
        }
    }, [page, size])
}
