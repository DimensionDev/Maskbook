import type { FungibleAsset, Pageable, HubOptions, HubIndicator, FungibleTokenStats } from '@masknet/web3-shared-base'

export namespace FungibleTokenAPI {
    export interface Provider<ChainId, SchemaType, Indicator = HubIndicator> {
        /** Get fungible token price. */
        getPrice?: (address: string, options?: HubOptions<ChainId>) => Promise<number>
        /** Get fungible asset. */
        getAsset?: (
            address: string,
            options?: HubOptions<ChainId>,
        ) => Promise<FungibleAsset<ChainId, SchemaType> | undefined>
        /** Get fungible assets. */
        getAssets(
            address: string,
            options?: HubOptions<ChainId>,
        ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, Indicator>>
        /** Get fungible token stats. */
        getStats?: (address: string, options?: HubOptions<ChainId>) => Promise<FungibleTokenStats | undefined>
    }
}
