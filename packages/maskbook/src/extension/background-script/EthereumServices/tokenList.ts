import { memoizePromise } from '@dimensiondev/kit'
import {
    ChainId,
    ERC20TokenDetailed,
    EthereumTokenType,
    formatEthereumAddress,
    getChainDetailed,
} from '@masknet/web3-shared'

interface TokenList {
    keywords: string[]
    logoURI: string
    name: string
    timestamp: string
    tokens: {
        address: string
        chainId: number
        name: string
        symbol: string
        decimals: number
        logoURI?: string
    }[]
    version: {
        major: number
        minor: number
        patch: number
    }
}

const fetchTokenList = memoizePromise(
    async (url: string) => {
        const response = await fetch(url, { cache: 'force-cache' })
        return response.json() as Promise<TokenList>
    },
    (url) => url,
)

/**
 * Fetch tokens from token list
 * @param url
 * @param chainId
 */
export async function fetchERC20TokensFromTokenList(
    url: string,
    chainId = ChainId.Mainnet,
): Promise<ERC20TokenDetailed[]> {
    return (await fetchTokenList(url)).tokens
        .filter(
            (x) =>
                x.chainId === chainId &&
                (process.env.NODE_ENV === 'production' && process.env.build === 'stable'
                    ? getChainDetailed(chainId)?.network === 'mainnet'
                    : true),
        )
        .map((x) => ({
            type: EthereumTokenType.ERC20,
            ...x,
        }))
}

/**
 * Fetch tokens from multiple token lists
 * @param urls
 * @param chainId
 */
export async function fetchERC20TokensFromTokenLists(
    urls: string[],
    chainId = ChainId.Mainnet,
): Promise<ERC20TokenDetailed[]> {
    const uniqueSet = new Set<string>()
    const tokens = (await Promise.allSettled(urls.map((x) => fetchERC20TokensFromTokenList(x, chainId)))).flatMap((x) =>
        x.status === 'fulfilled' ? x.value : [],
    )
    return tokens.filter((x) => {
        // checksummed address in one loop
        x.address = formatEthereumAddress(x.address)

        const key = x.address.toLowerCase()
        if (uniqueSet.has(key)) return false
        else {
            uniqueSet.add(key)
            return true
        }
    })
}
