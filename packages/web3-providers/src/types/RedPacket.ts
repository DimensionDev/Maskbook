import type { Transaction, HubOptions, Pageable, HubIndicator, NonFungibleCollection } from '@masknet/web3-shared-base'

export namespace RedPacketBaseAPI {
    export interface Provider<ChainId, SchemaType> {
        getHistories(
            chainId: ChainId,
            senderAddress: string,
            contractAddress: string,
            methodId: string,
            startBlock?: number,
            endBlock?: number,
        ): Promise<Array<Transaction<ChainId, SchemaType>> | undefined>

        /** Get non-fungible collections owned by the given account. */
        getCollectionsByOwner?: (
            account: string,
            options?: HubOptions<ChainId, HubIndicator>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, HubIndicator>>
    }

    export interface DataSourceProvider<ChainId, SchemaType> {
        getHistories(
            chainId: ChainId,
            senderAddress: string,
            contractAddress: string,
            methodId: string,
            startBlock?: number,
            endBlock?: number,
        ): Promise<Array<Transaction<ChainId, SchemaType>> | undefined>
    }
}
