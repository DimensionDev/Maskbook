import type { Pageable, PageIndicator } from '@masknet/shared-base'
import type { Transaction, NonFungibleCollection } from '@masknet/web3-shared-base'
import type { HubOptions_Base } from '../entry-types.js'

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
            isERC712Only?: boolean,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>>
    }
}
