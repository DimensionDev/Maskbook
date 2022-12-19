import type { SearchResult, SearchResultType } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'

export namespace DSearchBaseAPI {
    export interface Provider<ChainId, SchemaType, T extends NetworkPluginID> {
        search(keyword: string, type?: SearchResultType): Promise<Array<SearchResult<ChainId, SchemaType>>>
    }

    export interface DataSourceProvider<ChainId, NewType> {
        get(): Promise<Array<SearchResult<ChainId, NewType>>>
    }
}
