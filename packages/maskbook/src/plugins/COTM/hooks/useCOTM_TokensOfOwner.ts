import { useERC721TokenIdsOfOwner } from '../../../web3/hooks/useERC721TokensOfOwner'
import type { ERC721TokenDetailed } from '../../../web3/types'
import { useCOTM_Tokens } from './useCOTM_Tokens'

export function useCOTM_TokensOfOwner(token?: ERC721TokenDetailed) {
    const { value: tokenIds, ...result } = useERC721TokenIdsOfOwner(token)
    const totalTokens = useCOTM_Tokens(token)

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
