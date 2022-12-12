import type { NonFungibleTokenResult, SearchResult, SourceType } from '@masknet/web3-shared-base'
import urlcat from 'urlcat'
import { fetchCached } from '../../entry-helpers.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { DSearchBaseAPI } from '../../types/DSearch.js'

export interface FungibleToken {
    id: string | number
    name: string
    symbol: string
    sourceType: SourceType
}

export interface NonFungibleToken {
    address: string
    name: string
    chain: string
}

const BASE_URL = 'https://raw.githubusercontent.com/DimensionDev/Mask-Search-List/master/'

export class CoinGeckoSearchAPI<ChainId, SchemaType> implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    async get(): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const tokensURL = urlcat(BASE_URL, '/output/fungible-tokens/coin-gecko.json')
        return fetchJSON<Array<NonFungibleTokenResult<ChainId, SchemaType>>>(tokensURL, undefined, fetchCached)
    }
}
