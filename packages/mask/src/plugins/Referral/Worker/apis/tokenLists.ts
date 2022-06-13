import { TokenList } from '@masknet/web3-providers'
import { TokenType } from '@masknet/web3-shared-base'
import { type ChainId, getTokenListConstants, SchemaType } from '@masknet/web3-shared-evm'

import type { FungibleTokenDetailed } from '../../types'

import { fetchAttraceTokenList } from './discovery'

export const attraceTokenListMapper = async (): Promise<FungibleTokenDetailed[]> => {
    const tokenList = await fetchAttraceTokenList()

    return tokenList.map((token) => ({
        id: token.address,
        type: TokenType.Fungible,
        schema: SchemaType.ERC20,
        ...token,
        logoURL: token.logoURI,
    }))
}

// export const fetchERC20TokensFromTokenListsMap = async (
//     chainId: ChainId,
// ): Promise<Map<string, FungibleTokenDetailed>> => {
//     const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)

//     const allListResponse = await Promise.allSettled([
//         TokenList.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS),
//         attraceTokenListMapper(),
//     ])
//     const [tokensList, tokensListAttrace] = allListResponse.map((x) => (x.status === 'fulfilled' ? x.value : []))

//     return new Map([...tokensList, ...tokensListAttrace].map((token) => [token.address.toLowerCase(), token]))
// }

export const fetchERC20TokensFromTokenListsMap = async (
    chainId: ChainId,
): Promise<Map<string, FungibleTokenDetailed>> => {
    const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)

    const allListResponse = await Promise.allSettled([
        TokenList.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS),
        attraceTokenListMapper(),
    ])
    const [tokensList, tokensListAttrace] = allListResponse.map((x) => (x.status === 'fulfilled' ? x.value : []))

    return new Map([...tokensList, ...tokensListAttrace].map((token) => [token.address.toLowerCase(), token]))
}
