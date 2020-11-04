import { useERC721TokenIdsOfOwner } from '../../../web3/hooks/useERC721TokensOfOwner'
import type { ERC721Token } from '../../../web3/types'

export function useAllElectionTokensOfOwner(token?: ERC721Token) {
    const { value: tokenIds, ...result } = useERC721TokenIdsOfOwner(token)
    return {
        ...result,
        value: tokenIds.filter(Boolean).map((tokenId) => ({
            tokenId: tokenId ?? '',
            tokenImageURL: tokenId ? `${token?.baseURI}${tokenId}.gif` : '',
        })),
    }
}
