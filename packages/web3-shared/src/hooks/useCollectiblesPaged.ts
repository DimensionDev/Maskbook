import type { ERC721TokenDetailed } from '../types'
import { useAsyncRetry } from 'react-use'
import { useWeb3Context } from '../context'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useState } from 'react'
import { getERC721TokenDetailedOwnerListFromOpensea } from './useERC721TokenDetailedOwnerList'
import { useOpenseaAPIConstants } from '../constants'
import { useChainId } from './useChainId'
import { useAccount } from './useAccount'

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
    const { GET_ASSETS_URL } = useOpenseaAPIConstants()
    const owner = useAccount()
    const chainId = useChainId()

    const [cursor, setCursor] = useState(0)

    const getList = (offset: number, limit: number, url: string) =>
        getERC721TokenDetailedOwnerListFromOpensea(undefined, owner, url, offset, chainId, limit)

    const count = (page + 1) * size // 20

    return useAsyncRetry(async () => {
        const erc721Tokens = await getERC721TokensPaged(page, size)

        if (!owner || !GET_ASSETS_URL) {
            return {
                collectibles: erc721Tokens,
                hasNextPage: erc721Tokens.length === size,
            }
        }

        if (erc721Tokens.length < size && erc721Tokens.length !== 0) {
            const list = await getList(0, size - erc721Tokens.length, GET_ASSETS_URL)
            setCursor(size - erc721Tokens.length)
            return {
                collectibles: [...erc721Tokens, ...(list ?? [])],
                hasNextPage: size - erc721Tokens.length === list.length,
            }
        }

        if (erc721Tokens.length === 0) {
            const list = await getList(cursor + size, size, GET_ASSETS_URL)
            setCursor((prevState) => prevState + size)
            return {
                collectibles: list ?? [],
                hasNextPage: list.length === size ?? false,
            }
        }

        return {
            collectibles: erc721Tokens,
            hasNextPage: erc721Tokens.length === size,
        }
    }, [page, size])
}
