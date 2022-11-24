import type { SearchResult, SearchSourceType } from '@masknet/web3-shared-base'

export namespace DSearchBaseAPI {
    export interface Provider<ChainId, SchemaType> {
        search(keyword: string, source?: SearchSourceType): Promise<SearchResult<ChainId, SchemaType>>
    }
}
