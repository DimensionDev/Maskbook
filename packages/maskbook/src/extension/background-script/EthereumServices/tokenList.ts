import { formatChecksumAddress } from '../../../plugins/Wallet/formatter'
import { EthereumTokenType, ChainId, ERC20TokenDetailed } from '../../../web3/types'

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
    }[]
    version: {
        major: number
        minor: number
        patch: number
    }
}

async function fetchTokenList(url: string) {
    const response = await fetch(url, { cache: 'force-cache' })
    return response.json() as Promise<TokenList>
}

/**
 * Fetch tokens from token list
 * @param url
 * @param chainId
 */
export async function fetchERC20TokensFromTokenList(
    url: string,
    chainId: ChainId = ChainId.Mainnet,
): Promise<ERC20TokenDetailed[]> {
    const { tokens } = await fetchTokenList(url)
    return tokens
        .filter(
            (x) =>
                x.chainId === chainId && (process.env.NODE_ENV === 'production' ? chainId === ChainId.Mainnet : true),
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
    chainId: ChainId = ChainId.Mainnet,
): Promise<ERC20TokenDetailed[]> {
    const uniqueSet = new Set<string>()
    const tokens = (await Promise.allSettled(urls.map((x) => fetchERC20TokensFromTokenList(x, chainId)))).flatMap((x) =>
        x.status === 'fulfilled' ? x.value : [],
    )
    return tokens.filter((x) => {
        // checksummed address in one loop
        x.address = formatChecksumAddress(x.address)

        const key = x.address.toLowerCase()
        if (uniqueSet.has(key)) return false
        else {
            uniqueSet.add(key)
            return true
        }
    })
}
