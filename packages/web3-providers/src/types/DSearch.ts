import type { SearchResult } from '@masknet/web3-shared-base'

export namespace DSearchBaseAPI {
    export interface DataSourceProvider<ChainId, NewType> {
        get(): Promise<Array<SearchResult<ChainId, NewType>>>
    }
}
