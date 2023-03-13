import type { Pageable, PageIndicator } from '@masknet/shared-base'
import type { Transaction, HubOptions, NonFungibleCollection } from '@masknet/web3-shared-base'

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
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>>
    }
}
