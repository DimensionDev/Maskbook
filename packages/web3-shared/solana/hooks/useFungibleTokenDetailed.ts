import { TokenListProvider } from '@solana/spl-token-registry'
import { useAsyncRetry } from 'react-use'
import { createFungibleToken } from '../helpers'
import type { ChainId } from '../types'

async function getFungibleTokenDetailed(chainId: ChainId, pubkey: string) {
    const tokenListProvider = new TokenListProvider()
    const provider = await tokenListProvider.resolve()
    const tokenList = provider.filterByChainId(chainId).getList()
    const token = tokenList.find((y) => y.address === pubkey)

    if (!token) return null
    const isSafe = token.decimals !== 0 && token !== undefined
    if (!isSafe) return null

    const name = token.name || 'Unknown Token'
    const symbol = token.symbol || 'Unknown Token'
    const splToken = createFungibleToken(chainId, pubkey, name, symbol, token.decimals, token.logoURI)
    return splToken
}

export function useFungibleTokenDetailed(chainId: ChainId, pubkey: string) {
    return useAsyncRetry(async () => getFungibleTokenDetailed(chainId, pubkey), [chainId, pubkey])
}
