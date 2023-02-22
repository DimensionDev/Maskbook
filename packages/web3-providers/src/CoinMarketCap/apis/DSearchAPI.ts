import urlcat from 'urlcat'
import type { SourceType, FungibleTokenResult } from '@masknet/web3-shared-base'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { DSearchBaseAPI } from '../../types/DSearch.js'
import { DSEARCH_BASE_URL } from '../../DSearch/constants.js'

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

export class CoinMarketCapSearchAPI<ChainId, SchemaType>
    implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType>
{
    async get(): Promise<Array<FungibleTokenResult<ChainId, SchemaType>>> {
        const tokensURL = urlcat(DSEARCH_BASE_URL, '/fungible-tokens/coinmarketcap.json')
        return fetchJSON<Array<FungibleTokenResult<ChainId, SchemaType>>>(tokensURL)
    }
}
