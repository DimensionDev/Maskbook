import { useERC721TokenIdsOfOwner } from '../../../web3/hooks/useERC721TokensOfOwner'
import type { ERC721TokenDetailed } from '../../../web3/types'
import { useTokens } from './useTokens'

export function useTokensOfOwner(token?: ERC721TokenDetailed) {
    const { value: tokenIds, ...result } = useERC721TokenIdsOfOwner(token)
    const totalTokens = useTokens(token)

    if (!token || !totalTokens.length)
        return {
            ...result,
            value: [],
        }
    return {
        ...result,
        value: totalTokens.filter((x) => tokenIds.includes(x.tokenId)),
    }
}
