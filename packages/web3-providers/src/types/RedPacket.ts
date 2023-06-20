import type { Pageable, PageIndicator } from '@masknet/shared-base'
import type { RedPacketJSONPayloadFromChain } from '@masknet/web3-shared-evm'
import type { Transaction, NonFungibleCollection } from '@masknet/web3-shared-base'
import type { HubOptions_Base } from '../entry-types.js'

export namespace RedPacketBaseAPI {
    export interface Provider<ChainId, SchemaType> {
        getHistories?: (
            chainId: ChainId,
            senderAddress: string,
            contractAddress: string,
            methodId: string,
            startBlock: number,
            endBlock: number,
        ) => Promise<RedPacketJSONPayloadFromChain[] | undefined>

        getHistoryTransactions?: (
            chainId: ChainId,
            senderAddress: string,
            contractAddress: string,
            methodId: string,
            startBlock: number,
            endBlock: number,
        ) => Promise<Array<Transaction<ChainId, SchemaType>> | undefined>

        /** Get non-fungible collections owned by the given account. */
        getCollectionsByOwner?: (
            account: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>>
    }
}
