import { compact } from 'lodash-es'
import Fuse from 'fuse.js'
import { SearchResult, SearchResultType, isSameAddress } from '@masknet/web3-shared-base'
import type { Handler } from './type.js'

export const getHandlers = <ChainId, SchemaType>(): Array<Handler<ChainId, SchemaType>> => [
    {
        rules: [
            {
                key: 'token',
                type: 'exact',
                filter: (data: SearchResult<ChainId, SchemaType>, keyword: string) => {
                    if (data.type !== SearchResultType.FungibleToken) return false

                    if (data.alias?.map((x) => x.toLowerCase()).includes(keyword.toLowerCase())) return true

                    const symbol = data.symbol
                    if (symbol === keyword || symbol?.replace(/\s/g, '') === keyword) return true

                    const name = data.name
                    if (name === keyword) return true

                    const alias = data.alias
                    if (alias?.map((x) => x.toLowerCase()).includes(keyword.toLowerCase())) return true

                    return false
                },
            },
            {
                key: 'token',
                type: 'fuzzy',
                fullSearch<T extends SearchResult<ChainId, SchemaType> = SearchResult<ChainId, SchemaType>>(
                    keyword: string,
                    all: T[],
                ) {
                    const data = compact<T>(
                        all.map((x) => {
                            if (x.type !== SearchResultType.FungibleToken) return
                            return {
                                ...x,
                                __symbol: x.symbol?.replace(/\s/g, ''),
                                __name: x.name?.replace(/\s/g, ''),
                            }
                        }),
                    )

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
                key: 'token',
                type: 'exact',
                filter: (data: SearchResult<ChainId, SchemaType>, keyword: string) => {
                    if (data.type !== SearchResultType.NonFungibleToken) return false

                    return (
                        isSameAddress(data.address, keyword) ||
                        data.name === keyword ||
                        Boolean(data.alias?.map((x) => x.toLowerCase()).includes(keyword.toLowerCase()))
                    )
                },
            },
            {
                key: 'token',
                type: 'fuzzy',
                fullSearch<T extends SearchResult<ChainId, SchemaType> = SearchResult<ChainId, SchemaType>>(
                    keyword: string,
                    all: T[],
                ) {
                    const data = compact<T>(
                        all.map((x) => {
                            if (x.type !== SearchResultType.NonFungibleToken) return
                            return {
                                ...x,
                                __name: x.name?.replace(/\s/g, ''),
                            }
                        }),
                    )

                    const fuse = new Fuse(data, {
                        keys: [
                            { name: 'name', weight: 0.6 },
                            { name: '__name', weight: 0.4 },
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
        type: SearchResultType.NonFungibleToken,
    },
    {
        rules: [
            {
                key: 'twitter',
                type: 'exact',
                filter: (data: SearchResult<ChainId, SchemaType>, keyword: string) => {
                    if (data.type !== SearchResultType.NonFungibleCollection) return false
                    return data.collection?.socialLinks?.twitter === keyword
                },
            },
        ],
        type: SearchResultType.NonFungibleCollection,
    },
]
