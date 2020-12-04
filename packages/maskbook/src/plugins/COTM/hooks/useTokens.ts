import { hexToNumberString, soliditySha3 } from 'web3-utils'
import type { COTM_Token } from '../types'
import type { ERC721TokenDetailed } from '../../../web3/types'
import { MAX_TOKEN_COUNT } from '../constants'

export function useTokens(token?: ERC721TokenDetailed): COTM_Token[] {
    if (!token) return []
    return new Array(MAX_TOKEN_COUNT).fill(0).map((_, idx) => {
        const tokenId_ = soliditySha3({ t: 'string', v: 'hollandchina' }, { t: 'uint8', v: idx })
        const tokenId = tokenId_ ? hexToNumberString(tokenId_) : ''
        return {
            tokenId,
            tokenImageURL: tokenId ? `${token.baseURI}${tokenId}.gif` : '',
        }
    })
}
