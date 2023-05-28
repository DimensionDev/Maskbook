import type { SearchResult, SearchResultType } from '@masknet/web3-shared-base'

export namespace DSearchBaseAPI {
    export interface Provider<ChainId, SchemaType> {
        search(keyword: string, type?: SearchResultType): Promise<Array<SearchResult<ChainId, SchemaType>>>
    }

    export interface DataSourceProvider<ChainId, NewType> {
        get(): Promise<Array<SearchResult<ChainId, NewType>>>
    }
}
