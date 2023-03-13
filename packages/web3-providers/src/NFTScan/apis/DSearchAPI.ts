import urlcat from 'urlcat'
import type { NonFungibleCollectionResult, SearchResult, SourceType } from '@masknet/web3-shared-base'
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

export class NFTScanSearchAPI<ChainId, SchemaType> implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    async get(): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const nftsURL = urlcat(DSEARCH_BASE_URL, '/non-fungible-tokens/nftscan.json')
        return fetchJSON<Array<SearchResult<ChainId, SchemaType>>>(nftsURL)
    }
}

export class NFTScanCollectionSearchAPI<ChainId, SchemaType>
    implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType>
{
    async get(): Promise<Array<NonFungibleCollectionResult<ChainId, SchemaType>>> {
        return fetchJSON<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/specific-list.json'),
        )
    }
}
