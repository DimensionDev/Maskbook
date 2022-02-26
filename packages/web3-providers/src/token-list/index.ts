import { groupBy } from 'lodash-unified'
import { memoizePromise } from '@dimensiondev/kit'
import { TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, EthereumTokenType, formatEthereumAddress, getChainDetailed } from '@masknet/web3-shared-evm'
import type { TokenListBaseAPI } from '../types'

const NATIVE_TOKEN_ADDRESS_IN_1INCH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const fetchTokenList = memoizePromise(
    async (url: string) => {
        const response = await fetch(url, { cache: 'force-cache' })
        return response.json() as Promise<TokenListBaseAPI.TokenList | TokenListBaseAPI.TokenObject>
    },
    (url) => url,
)

/**
 * Fetch tokens from 1inch token list
 * @param url
 * @param chainId
 */
async function fetch1inchERC20TokensFromTokenList(
    url: string,
    chainId = ChainId.Mainnet,
): Promise<Web3Plugin.FungibleToken[]> {
    const tokens = ((await fetchTokenList(url)) as TokenListBaseAPI.TokenObject).tokens
    const _tokens = Object.values(tokens)
    return _tokens
        .filter((x) => x.address.toLowerCase() !== NATIVE_TOKEN_ADDRESS_IN_1INCH)
        .map((x) => ({
            id: x.address,
            type: TokenType.Fungible,
            subType: EthereumTokenType.ERC20,
            ...x,
            chainId: chainId,
            logoURI: x.logoURI ? [x.logoURI] : [],
        }))
}

/**
 * Fetch tokens from common token list
 * @param url
 * @param chainId
 */
async function fetchCommonERC20TokensFromTokenList(
    url: string,
    chainId = ChainId.Mainnet,
): Promise<Web3Plugin.FungibleToken[]> {
    return ((await fetchTokenList(url)) as TokenListBaseAPI.TokenList).tokens
        .filter(
            (x) =>
                x.chainId === chainId &&
                (process.env.NODE_ENV === 'production' && process.env.channel === 'stable'
                    ? getChainDetailed(chainId)?.network === 'mainnet'
                    : true),
        )
        .map((x) => ({
            id: x.address,
            type: TokenType.Fungible,
            subType: EthereumTokenType.ERC20,
            ...x,
            logoURI: x.logoURI ? [x.logoURI] : [],
        }))
}

/**
 * Fetch tokens adapter
 * @param urls
 * @param chainId
 */
async function fetchERC20TokensFromTokenList(urls: string[], chainId = ChainId.Mainnet) {
    const allRequest = urls.map(async (x) => {
        if (x.includes('1inch')) {
            const tokens = await fetch1inchERC20TokensFromTokenList(x, chainId)
            return { tokens, weight: 0 }
        }

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
export class TokenListAPI implements TokenListBaseAPI.Provider {
    async fetchFungibleTokensFromTokenLists(chainId: ChainId, url: string[]) {
        const result = memoizePromise(
            async (urls: string[], chainId = ChainId.Mainnet): Promise<Web3Plugin.FungibleToken[]> => {
                const tokens = (await fetchERC20TokensFromTokenList(urls, chainId))
                    .sort((a, b) => b.weight - a.weight)
                    .flatMap((x) => x.tokens)
                const groupedToken = groupBy(tokens, (x) => x.address.toLowerCase())

                return Object.values(groupedToken).map((tokenList) => {
                    const logoURIs = tokenList
                        .map((token) => token.logoURI)
                        .flat()
                        .filter((token) => !!token) as string[]
                    return {
                        ...tokenList[0],
                        ...{ address: formatEthereumAddress(tokenList[0].address) },
                        ...{ logoURI: logoURIs },
                    }
                })
            },
            (urls, chainId) => `${chainId}-${urls.join()}`,
        )

        return result(url, chainId)
    }
}
