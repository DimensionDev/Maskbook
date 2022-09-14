import { EMPTY_LIST } from '@masknet/shared-base'
import { R2D2 } from '@masknet/web3-providers'
import { type ChainId, getTokenListConstants } from '@masknet/web3-shared-evm'
import { TOKEN_LIST_URL } from '../../constants.js'

export const fetchERC20TokensFromTokenListsMap = async (chainId: ChainId) => {
    const { FUNGIBLE_TOKEN_LISTS = EMPTY_LIST } = getTokenListConstants(chainId)
    const ERC20Tokens = await R2D2.getFungibleTokenList(chainId, [...FUNGIBLE_TOKEN_LISTS, TOKEN_LIST_URL])

    return new Map(ERC20Tokens.map((token) => [token.address.toLowerCase(), token]))
}
