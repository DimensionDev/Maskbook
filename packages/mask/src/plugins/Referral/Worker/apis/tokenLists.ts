import { TokenList } from '@masknet/web3-providers'
import { type ChainId, getTokenListConstants } from '@masknet/web3-shared-evm'

import { TOKEN_LIST_URL } from '../../constants'

export const fetchERC20TokensFromTokenListsMap = async (chainId: ChainId) => {
    const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
    const ERC20Tokens = await TokenList.fetchFungibleTokensFromTokenLists(chainId, [
        ...FUNGIBLE_TOKEN_LISTS,
        TOKEN_LIST_URL,
    ])

    return new Map(ERC20Tokens.map((token) => [token.address.toLowerCase(), token]))
}
