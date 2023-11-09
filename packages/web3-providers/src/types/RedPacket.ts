import type { Pageable, PageIndicator } from '@masknet/shared-base'
import type { NftRedPacketJSONPayload, RedPacketJSONPayloadFromChain } from '../RedPacket/types.js'
import type { Transaction, NonFungibleCollection } from '@masknet/web3-shared-base'
import type { BaseHubOptions } from '../entry-types.js'

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

        getNFTHistories?: (
            chainId: ChainId,
            senderAddress: string,
            contractAddress: string,
            methodId: string,
            startBlock: number,
            endBlock: number,
        ) => Promise<NftRedPacketJSONPayload[] | undefined>

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
            options?: BaseHubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>>
    }
}
