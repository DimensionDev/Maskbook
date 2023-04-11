import urlcat from 'urlcat'
import type { NonFungibleCollectionResult, SearchResult, SourceType } from '@masknet/web3-shared-base'
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

export class NFTScanSearchAPI<ChainId, SchemaType> implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType> {
    async get(): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const nfts = fetchFromDSearch<Array<SearchResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/non-fungible-tokens/nftscan.json'),
            { mode: 'cors' },
        )
        const collections = fetchFromDSearch<Array<SearchResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/nftscan.json'),
            { mode: 'cors' },
        )
        const collectionsFromSpecialList = fetchFromDSearch<Array<SearchResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/specific-list.json'),
            { mode: 'cors' },
        )
        return (await Promise.allSettled([collectionsFromSpecialList, nfts, collections])).flatMap((v) =>
            v.status === 'fulfilled' && v.value ? v.value : [],
        )
    }
}

export class NFTScanCollectionSearchAPI<ChainId, SchemaType>
    implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType>
{
    async get(): Promise<Array<NonFungibleCollectionResult<ChainId, SchemaType>>> {
        const collectionsFromSpecialList = fetchFromDSearch<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/specific-list.json'),
            { mode: 'cors' },
        )
        const collections = fetchFromDSearch<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/nftscan.json'),
            { mode: 'cors' },
        )
        return (await Promise.allSettled([collectionsFromSpecialList, collections])).flatMap((v) =>
            v.status === 'fulfilled' && v.value ? v.value : [],
        )
    }
}
