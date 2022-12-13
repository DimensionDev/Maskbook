import type { SearchResult, SearchResultType } from '@masknet/web3-shared-base'

export interface rule<ChainId, SchemaType> {
    key: string
    type: 'exact' | 'fuzzy'
    filter?: (
        data: SearchResult<ChainId, SchemaType>,
        keyword: string,
        all: Array<SearchResult<ChainId, SchemaType>>,
    ) => boolean

    fullSearch?: (
        keyword: string,
        all: Array<SearchResult<ChainId, SchemaType>>,
    ) => Array<SearchResult<ChainId, SchemaType>>
}

export interface handler<ChainId, SchemaType> {
    rules: Array<rule<ChainId, SchemaType>>
    type?: SearchResultType
}
