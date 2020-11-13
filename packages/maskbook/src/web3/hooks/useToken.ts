import { Token, EthereumTokenType } from '../types'
import { useEther } from './useEther'
import { useERC20Token } from './useERC20Token'
import { useERC721Token } from './useERC721Token'

/**
 * Fetch token info from chain
 * @param token
 */
export function useToken(token?: PartialRequired<Token, 'address' | 'type'>) {
    const ether = useEther(token)
    const erc20 = useERC20Token(token)
    const erc721 = useERC721Token(token)
    if (!token)
        return {
            loading: false,
            error: null,
            value: void 0,
        }
    if (token.type === EthereumTokenType.Ether) return ether
    if (token.type === EthereumTokenType.ERC20) return erc20
    if (token.type === EthereumTokenType.ERC721) return erc721
    throw new Error('not supported')
}
