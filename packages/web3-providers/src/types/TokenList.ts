import type { FungibleToken, NonFungibleToken } from '@masknet/web3-shared-base'

export namespace TokenListBaseAPI {
    export interface Token<ChainId> {
        chainId: ChainId
        address: string
        name: string
        symbol: string
        decimals: number
        logoURI?: string
    }

    export interface TokenList<ChainId> {
        keywords: string[]
        logoURI: string
        name: string
        timestamp: string
        tokens: Array<Token<ChainId>>
        version: {
            major: number
            minor: number
            patch: number
        }
    }

    export interface TokenObject<ChainId> {
        tokens: Record<string, Token<ChainId>>
    }

    export interface Provider<ChainId, SchemaType> {
        getFungibleTokens: (chainId: ChainId, urls: string[]) => Promise<Array<FungibleToken<ChainId, SchemaType>>>
        getNonFungibleTokens: (
            chainId: ChainId,
            urls: string[],
        ) => Promise<Array<NonFungibleToken<ChainId, SchemaType>>>
    }
}
