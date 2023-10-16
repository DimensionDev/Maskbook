import type { SearchResult, SearchResultType } from '@masknet/web3-shared-base'

interface Rule<ChainId, SchemaType> {
    key: string
    type: 'exact' | 'fuzzy'
    filter?: (
        data: SearchResult<ChainId, SchemaType>,
        keyword: string,
        all: Array<SearchResult<ChainId, SchemaType>>,
    ) => boolean
    fullSearch?<T extends SearchResult<ChainId, SchemaType> = SearchResult<ChainId, SchemaType>>(
        keyword: string,
        all: T[],
    ): T[]
}

export interface Handler<ChainId, SchemaType> {
    types: SearchResultType[]
    rules: Array<Rule<ChainId, SchemaType>>
}
