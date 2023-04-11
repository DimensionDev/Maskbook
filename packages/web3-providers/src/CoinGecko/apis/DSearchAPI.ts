import urlcat from 'urlcat'
import type { SourceType, FungibleTokenResult } from '@masknet/web3-shared-base'
import { DSEARCH_BASE_URL } from '../../DSearch/constants.js'
import { fetchFromDSearch } from '../../DSearch/helpers.js'
import type { DSearchBaseAPI } from '../../entry-types.js'

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

export class CoinGeckoSearchAPI<ChainId, SchemaType> implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    async get(): Promise<Array<FungibleTokenResult<ChainId, SchemaType>>> {
        return fetchFromDSearch<Array<FungibleTokenResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/fungible-tokens/coingecko.json'),
            { mode: 'cors' },
        )
    }
}
