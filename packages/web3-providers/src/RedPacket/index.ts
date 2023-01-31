import { Transaction, attemptUntil, createIndicator, createPageable } from '@masknet/web3-shared-base'
import type { RedPacketBaseAPI } from '../types/RedPacket.js'
import { ChainbaseAPI } from './apis/chainbase.js'
import { ExplorerAPI } from './apis/explorer.js'
import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { HubIndicator, HubOptions, NonFungibleCollection, Pageable } from '@masknet/web3-shared-base'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchJSON } from '../entry-helpers.js'

export class RedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    private ChainbaseClient = new ChainbaseAPI<ChainId, SchemaType>()
    private ExplorerClient = new ExplorerAPI<ChainId, SchemaType>()
    getHistories(): Promise<Array<Transaction<ChainId, SchemaType>>> {
        return attemptUntil(
            [async () => this.ExplorerClient.getHistories(), async () => this.ChainbaseClient.getHistories()],
            [],
        )
    }

    async getCollectionsByOwner(
        account: string,
        { chainId, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, HubIndicator>> {
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
