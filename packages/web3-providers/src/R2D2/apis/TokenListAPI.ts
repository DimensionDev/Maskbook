import { memoize, uniqBy } from 'lodash-es'
import { memoizePromise } from '@masknet/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import { env } from '@masknet/flags'
import { type FungibleToken, type NonFungibleToken, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, formatEthereumAddress, getTokenListConstants } from '@masknet/web3-shared-evm'
import { EVMChainResolver } from '../../Web3/EVM/apis/ResolverAPI.js'
import { Duration } from '../../helpers/fetchCached.js'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import type { TokenListAPI } from '../../entry-types.js'

const fetchTokenList = memoizePromise(
    memoize,
    async (url: string) => {
        return fetchCachedJSON<TokenListAPI.TokenList<ChainId> | TokenListAPI.TokenObject<ChainId>>(
            url,
            { cache: 'default' },
            {
                cacheDuration: Duration.TWELVE_HOURS,
            },
        )
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
    return ((await fetchTokenList(url)) as TokenListAPI.TokenList<ChainId>).tokens
        .filter(
            (x) =>
                x.chainId === chainId &&
                (process.env.NODE_ENV === 'production' && env.channel === 'stable' ?
                    EVMChainResolver.isMainnet(chainId)
                :   true),
        )
        .map((x) => ({
            id: x.address,
            type: TokenType.Fungible,
            schema: SchemaType.ERC20,
            ...x,
            logoURL: x.originLogoURI || x.logoURI,
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
class R2D2TokenListAPI implements TokenListAPI.Provider<ChainId, SchemaType> {
    async getFungibleTokenList(chainId: ChainId, urls?: string[]) {
        const { FUNGIBLE_TOKEN_LISTS = EMPTY_LIST } = getTokenListConstants(chainId)
        const result = memoizePromise(
            memoize,
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
            (urls, chainId) => `${chainId}-${urls.join(',')}`,
        )

        return result(urls ?? FUNGIBLE_TOKEN_LISTS, chainId)
    }
    async getNonFungibleTokenList(
        chainId: ChainId,
        urls?: string[],
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        return EMPTY_LIST
    }
}

export const R2D2TokenList = new R2D2TokenListAPI()
