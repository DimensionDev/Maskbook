import { TokenList } from '@masknet/web3-providers'
import { type ChainId, getTokenListConstants } from '@masknet/web3-shared-evm'

export const fetchERC20TokensFromTokenListsMap = async (chainId: ChainId) => {
    const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
    const ERC20Tokens = await TokenList.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS)

    return new Map(ERC20Tokens.map((token) => [token.address.toLowerCase(), token]))
}
