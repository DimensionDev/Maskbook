import type { PageIndicator, Pageable } from '@masknet/shared-base'
import type { FungibleAsset, FungibleTokenStats, FungibleToken } from '@masknet/web3-shared-base'
import type { HubOptions_Base } from '../Web3/Base/apis/HubOptionsAPI.js'

export namespace FungibleTokenAPI {
    export interface Provider<ChainId, SchemaType, Indicator = PageIndicator> {
        /** Get fungible token price. */
        getPrice?: (address: string, options?: HubOptions_Base<ChainId, Indicator>) => Promise<number>
        /** Get fungible asset. */
        getAsset?: (
            address: string,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<FungibleAsset<ChainId, SchemaType> | undefined>
        /** Get fungible assets. */
        getAssets?: (
            address: string,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>, Indicator>>
        /** Get trusted fungible assets. */
        getTrustedAssets?: (
            address: string,
            trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<Pageable<FungibleAsset<ChainId, SchemaType>, Indicator>>
        /** Get fungible token stats. */
        getStats?: (
            address: string,
            options?: HubOptions_Base<ChainId, Indicator>,
        ) => Promise<FungibleTokenStats | undefined>
    }
}
