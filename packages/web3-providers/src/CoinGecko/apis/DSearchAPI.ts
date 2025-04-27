import urlcat from 'urlcat'
import type { FungibleTokenResult } from '@masknet/web3-shared-base'
import { DSEARCH_BASE_URL } from '../../DSearch/constants.js'
import { fetchFromDSearch } from '../../DSearch/helpers.js'
import type { DSearchBaseAPI } from '../../entry-types.js'

export class CoinGeckoSearchAPI<ChainId, SchemaType> implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    async get(): Promise<Array<FungibleTokenResult<ChainId, SchemaType>>> {
        return fetchFromDSearch<Array<FungibleTokenResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/fungible-tokens/coingecko.json?update=1'),
            { mode: 'cors' },
        )
    }
}
