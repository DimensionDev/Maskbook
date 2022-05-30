import { uniqBy } from 'lodash-unified'
import { memoizePromise } from '@dimensiondev/kit'
import { FungibleToken, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, formatEthereumAddress, chainResolver } from '@masknet/web3-shared-evm'
import type { TokenListBaseAPI } from '../types'

const fetchTokenList = memoizePromise(
    async (url: string) => {
        const response = await fetch(url, { cache: 'force-cache' })
        return response.json() as Promise<TokenListBaseAPI.TokenList<ChainId> | TokenListBaseAPI.TokenObject<ChainId>>
    },
    (url) => url,
)

/**
 * Fetch tokens from common token list
 * @param url
 * @param chainId
 */
async function fetchCommonERC20TokensFromTokenList(
    url: string,
    chainId = ChainId.Mainnet,
): Promise<Array<FungibleToken<ChainId, SchemaType.ERC20>>> {
    return ((await fetchTokenList(url)) as TokenListBaseAPI.TokenList<ChainId>).tokens
        .filter(
            (x) =>
                x.chainId === chainId &&
                (process.env.NODE_ENV === 'production' && process.env.channel === 'stable'
                    ? chainResolver.isMainnet(chainId)
                    : true),
        )
        .map((x) => ({
            id: x.address,
            type: TokenType.Fungible,
            schema: SchemaType.ERC20,
            ...x,
            logoURL: x.logoURI,
        }))
}

/**
 * Fetch tokens adapter
 * @param urls
 * @param chainId
 */
async function fetchERC20TokensFromTokenList(urls: string[], chainId = ChainId.Mainnet) {
    const allRequest = urls.map(async (x) => {
        const tokens = await fetchCommonERC20TokensFromTokenList(x, chainId)
        return { tokens, weight: x.startsWith('https://tokens.r2d2.to') ? 1 : 0 }
    })

    const allListResponse = await Promise.allSettled(allRequest)
    return allListResponse.map((x) => (x.status === 'fulfilled' ? x.value : { tokens: [], weight: 0 }))
}

/**
 * Fetch tokens from multiple token lists
 * @param urls
 * @param chainId
 */
export class TokenListAPI implements TokenListBaseAPI.Provider<ChainId, SchemaType> {
    async fetchFungibleTokensFromTokenLists(chainId: ChainId, url: string[]) {
        const result = memoizePromise(
            async (urls: string[], chainId = ChainId.Mainnet): Promise<Array<FungibleToken<ChainId, SchemaType>>> => {
                const tokens = (await fetchERC20TokensFromTokenList(urls, chainId))
                    .sort((a, b) => b.weight - a.weight)
                    .flatMap((x) => x.tokens)

                return uniqBy(tokens, (x) => x.address.toLowerCase()).map((token) => {
                    return {
                        ...token,
                        address: formatEthereumAddress(token.address),
                    }
                })
            },
            (urls, chainId) => `${chainId}-${urls.join()}`,
        )

        return result(url, chainId)
    }
}
