import type { NetworkPluginID } from '@masknet/shared-base'
import type { FungibleToken, NonFungibleToken } from '@masknet/web3-shared-base'

export namespace DSearchBaseAPI {
    /**
     * The source component to search a keyword
     */
    export enum Source {
        Main = 'Main',
        Sidebar = 'Sidebar',
    }

    /**
     * The type of resulted result.
     */
    export enum Type {
        // e.g., 0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        Address = 'Address',
        // e.g., vitalik.eth or vitalik.bnb
        Domain = 'Domain',
        // e.g., $MASK #MASK
        FungibleToken = 'FungibleToken',
        // e.g., $PUNK #PUNK
        NonFungibleToken = 'NonFungibleToken',
    }

    export interface Result<ChainId> {
        pluginID: NetworkPluginID
        chainId: ChainId
        type: Type
        label: string
        keyword: string
    }

    export interface AddressResult<ChainId> extends Result<ChainId> {
        type: Type.Address
    }

    export interface DomainResult<ChainId> extends Result<ChainId> {
        type: Type.Domain
    }

    export interface FungibleTokenResult<ChainId, SchemaType> extends Result<ChainId> {
        address: string
        token?: FungibleToken<ChainId, SchemaType>
    }

    export interface NonFungibleTokenResult<ChainId, SchemaType> extends Result<ChainId> {
        address: string
        tokenId: string
        token?: NonFungibleToken<ChainId, SchemaType>
    }

    export type SearchResult<ChainId, SchemaType> =
        | AddressResult<ChainId>
        | DomainResult<ChainId>
        | FungibleTokenResult<ChainId, SchemaType>
        | NonFungibleTokenResult<ChainId, SchemaType>

    export interface Provider<ChainId, SchemaType> {
        search(keyword: string, source?: Source): Promise<SearchResult<ChainId, SchemaType>>
    }
}
