import urlcat from 'urlcat'
import type { NonFungibleCollectionResult, SearchResult, SourceType } from '@masknet/web3-shared-base'
import { fetchCached } from '../../entry-helpers.js'
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
        const collectionsURL = urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/nftscan.json')
        const nfts = fetchJSON<Array<SearchResult<ChainId, SchemaType>>>(nftsURL, undefined, fetchCached)
        const collections = fetchJSON<Array<SearchResult<ChainId, SchemaType>>>(collectionsURL, undefined, fetchCached)

        return (await Promise.allSettled([nfts, collections])).flatMap((v) =>
            v.status === 'fulfilled' && v.value ? v.value : [],
        )
    }
}

export class NFTScanCollectionSearchAPI<ChainId, SchemaType>
    implements DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType>
{
    async get(): Promise<Array<NonFungibleCollectionResult<ChainId, SchemaType>>> {
        const collectionsURL = urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/nftscan.json')
        const collectionsFromSpecialList = await fetchJSON<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
            urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/specific-list.json'),
            undefined,
            fetchCached,
        )
        const collections = await fetchJSON<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
            collectionsURL,
            undefined,
            fetchCached,
        )
        return (await Promise.allSettled([collectionsFromSpecialList, collections])).flatMap((v) =>
            v.status === 'fulfilled' && v.value ? v.value : [],
        )
    }
}
