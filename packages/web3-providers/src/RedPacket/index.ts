import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import { createIndicator, createPageable, type PageIndicator, type Pageable } from '@masknet/shared-base'
import { type Transaction, attemptUntil, type HubOptions, type NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacketAPI } from '../Etherscan/index.js'
import { fetchJSON } from '../entry-helpers.js'
import type { RedPacketBaseAPI } from '../entry-types.js'

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
                    this.ChainbaseRedPacket.getHistories(
                        chainId,
                        senderAddress,
                        contractAddress,
                        methodId,
                        startBlock,
                        endBlock,
                    ),
                async () =>
                    this.EtherscanRedPacket.getHistories(
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
        { chainId, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const url = urlcat(DSEARCH_BASE_URL, '/nft-lucky-drop/specific-list.json')
        const result = await fetchJSON<{
            [owner: string]: Array<NonFungibleCollection<ChainId, SchemaType>>
        }>(url)
        const list = mapKeys(result, (_v, k) => k.toLowerCase())?.[account.toLowerCase()].filter(
            (x) => x.chainId === chainId,
        )
        return createPageable(list, createIndicator(indicator))
    }
}
