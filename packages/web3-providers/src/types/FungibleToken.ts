import type { FungibleAsset, Pageable, HubOptions, HubIndicator, FungibleTokenStats } from '@masknet/web3-shared-base'

export namespace FungibleTokenAPI {
    export interface Provider<ChainId, SchemaType, Indicator = HubIndicator> {
        /** Get fungible assets. */
        getAssets(
            address: string,
            options?: HubOptions<ChainId>,
        ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, Indicator>>
        /** Get fungible token stats. */
        getStats?: (address: string, options?: HubOptions<ChainId>) => Promise<FungibleTokenStats | undefined>
    }
}
