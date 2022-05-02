import { TokenList } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'

export const fetchERC20TokensFromTokenListsMap = async (ERC20: string[], chainId: ChainId) => {
    const ERC20Tokens = await TokenList.fetchERC20TokensFromTokenLists(ERC20, chainId)

    return new Map(ERC20Tokens.map((token) => [token.address.toLowerCase(), token]))
}
