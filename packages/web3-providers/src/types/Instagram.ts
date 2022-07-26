import type { FungibleToken } from '@masknet/web3-shared-base'

export namespace InstagramBaseAPI {
    export interface Provider {
        uploadUserAvatar: (
            image: File | Blob,
            userId: string,
        ) => Promise<
            | {
                  changed_profile: boolean
                  profile_pic_url_hd: string
              }
            | undefined
        >
    }
}

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
        fetchFungibleTokensFromTokenLists: (
            chainId: ChainId,
            urls: string[],
        ) => Promise<Array<FungibleToken<ChainId, SchemaType>>>
    }
}
