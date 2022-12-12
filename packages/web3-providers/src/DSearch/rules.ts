import { FungibleTokenResult, SearchResult, SearchResultType } from '@masknet/web3-shared-base'
import Fuse from 'fuse.js'
import type { handler } from './type.js'

export const getHandlers = <ChainId, SchemaType>(): Array<handler<ChainId, SchemaType>> => [
    {
        rules: [
            {
                key: 'token',
                type: 'exact',
                filter: (
                    data: SearchResult<ChainId, SchemaType>,
                    keyword: string,
                    all: Array<SearchResult<ChainId, SchemaType>>,
                ) => {
                    const symbol = (data as FungibleTokenResult<ChainId, SchemaType>).symbol
                    if (symbol === keyword || symbol?.replace(/\s/g, '') === keyword) return true

                    const name = (data as FungibleTokenResult<ChainId, SchemaType>)?.name
                    if (name === keyword) return true

                    return false
                },
            },
            {
                key: 'token',
                type: 'fuzzy',
                fullSearch: (keyword: string, all: Array<SearchResult<ChainId, SchemaType>>) => {
                    const data = (all as Array<FungibleTokenResult<ChainId, SchemaType>>)
                        .filter((x) => x.type === SearchResultType.FungibleToken)
                        .map((x) => ({
                            ...x,
                            __symbol: x.symbol?.replace(/\s/g, ''),
                            __name: x.name?.replace(/\s/g, ''),
                        }))

                    const fuse = new Fuse(data, {
                        keys: [
                            { name: 'symbol', weight: 0.5 },
                            { name: '__symbol', weight: 0.4 },
                            { name: '__name', weight: 0.3 },
                            { name: 'name', weight: 0.3 },
                        ],
                        isCaseSensitive: false,
                        ignoreLocation: true,
                        shouldSort: true,
                        threshold: 0,
                        minMatchCharLength: 5,
                    })

                    return fuse.search(keyword).map((x) => all[x.refIndex])
                },
            },
        ],
        type: SearchResultType.FungibleToken,
    },
    {
        rules: [
            {
                key: 'twitter',
                type: 'exact',
                filter: (
                    data: SearchResult<ChainId, SchemaType>,
                    keyword: string,
                    all: Array<SearchResult<ChainId, SchemaType>>,
                ) => {
                    if (data.type !== SearchResultType.NonFungibleCollection) return false
                    return data.collection?.socialLinks?.twitter === keyword
                },
            },
        ],
        type: SearchResultType.NonFungibleCollection,
    },
]
