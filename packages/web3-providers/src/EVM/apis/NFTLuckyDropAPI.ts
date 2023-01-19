import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import type { HubIndicator, HubOptions, NonFungibleCollection, Pageable } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { createIndicator, createPageable } from '@masknet/web3-shared-base'
import { DSEARCH_BASE_URL } from '../../DSearch/constants.js'
import { fetchJSON } from '../../entry-helpers.js'
import type { NonFungibleTokenAPI } from '../../entry-types.js'

export class NFTLuckyDropAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getCollectionsByOwner(
        account: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
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
