import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import { createIndicator, createPageable, type PageIndicator, type Pageable } from '@masknet/shared-base'
import { type Transaction, attemptUntil, type NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchFromDSearch } from '../DSearch/helpers.js'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacketAPI } from '../Etherscan/index.js'
import type { HubOptions_Base, RedPacketBaseAPI } from '../entry-types.js'

export class RedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    private ChainbaseRedPacket = new ChainbaseRedPacketAPI()
    private EtherscanRedPacket = new EtherscanRedPacketAPI()

    getHistories(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        startBlock?: number,
        endBlock?: number,
    ): Promise<Array<Transaction<ChainId, SchemaType>> | undefined> {
        return attemptUntil(
            [
                async () =>
                    this.EtherscanRedPacket.getHistories(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                        startBlock,
                        endBlock,
                    ),
                async () =>
                    this.ChainbaseRedPacket.getHistories(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                        startBlock,
                        endBlock,
                    ),
            ],
            [],
        )
    }

    async getCollectionsByOwner(
        account: string,
        isERC712Only = false,
        { chainId, indicator }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const result = await fetchFromDSearch<{
            [owner: string]: Array<NonFungibleCollection<ChainId, SchemaType>>
        }>(urlcat(DSEARCH_BASE_URL, '/nft-lucky-drop/specific-list.json'))
        const list = mapKeys(result, (_v, k) => k.toLowerCase())?.[account.toLowerCase()].filter(
            (x) => x.chainId === chainId,
        )
        return createPageable(list, createIndicator(indicator))
    }
}
