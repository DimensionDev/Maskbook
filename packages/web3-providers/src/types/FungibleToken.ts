import type {
    FungibleAsset,
    Pageable,
    HubOptions,
    HubIndicator,
    FungibleTokenStats,
    FungibleToken,
} from '@masknet/web3-shared-base'

export namespace FungibleTokenAPI {
    export interface Provider<ChainId, SchemaType, Indicator = HubIndicator> {
        /** Get fungible token price. */
        getPrice?: (address: string, options?: HubOptions<ChainId, Indicator>) => Promise<number>
        /** Get fungible asset. */
        getAsset?: (
            address: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<FungibleAsset<ChainId, SchemaType> | undefined>
        /** Get fungible assets. */
        getAssets?: (
            address: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>, Indicator>>
        /** Get trusted fungible assets. */
        getTrustedAssets?: (
            address: string,
            trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>, Indicator>>
        /** Get fungible token stats. */
        getStats?: (
            address: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<FungibleTokenStats | undefined>
    }
}
