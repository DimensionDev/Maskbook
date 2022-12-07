import type { NonFungibleTokenResult, SearchResult, SourceType } from '@masknet/web3-shared-base'
import urlcat from 'urlcat'
import { fetchJSON } from '../../helpers.js'
import type { DSearchBaseAPI } from '../../index.js'

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

const BASE_URL = 'http://mask.io'

export class CoinGeckoSearchAPI<ChainId, SchemaType> implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    async get(): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const tokensURL = urlcat(BASE_URL, '/output/fungible-tokens/coin-geoko.json')
        return fetchJSON<Array<NonFungibleTokenResult<ChainId, SchemaType>>>(tokensURL)
    }
}
