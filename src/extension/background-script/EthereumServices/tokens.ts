import { Token, EthereumTokenType, ChainId } from '../../../web3/types'
import { flatMap, uniq } from 'lodash-es'

interface TokenList {
    keywords: string[]
    logoURI: string
    name: string
    timestamp: string
    tokens: {
        address: string
        chainId: number
        decimals: number
        name: string
        symbol: string
    }[]
    version: {
        major: number
        minor: number
        patch: number
    }
}

export async function fetchTokenList(url: string) {
    const response = await fetch(url, { cache: 'force-cache' })
    return response.json() as Promise<TokenList>
}

export async function fetchTokensFromTokenList(url: string, chainId: ChainId = ChainId.Mainnet): Promise<Token[]> {
    const { tokens } = await fetchTokenList(url)
    return tokens
        .filter((x) => x.chainId === chainId)
        .map((x) => ({
            type: EthereumTokenType.ERC20,
            ...x,
        }))
}

export async function fetchTokensFromTokenLists(urls: string[], chainId: ChainId = ChainId.Mainnet): Promise<Token[]> {
    const uniqueSet = new Set<string>()
    const tokens = (await Promise.allSettled(urls.map((x) => fetchTokensFromTokenList(x, chainId)))).flatMap((x) =>
        x.status === 'fulfilled' ? x.value : [],
    )
    return tokens.filter((x) => {
        const key = x.address.toLowerCase()
        if (uniqueSet.has(key)) return false
        else {
            uniqueSet.add(key)
            return true
        }
    })
}
