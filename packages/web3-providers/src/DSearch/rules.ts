import { compact } from 'lodash-es'
import { type SearchResult, SearchResultType } from '@masknet/web3-shared-base'
import type { Handler } from './types.js'
import Fuse from 'fuse.js'
export const getHandlers = <ChainId, SchemaType>(): Array<Handler<ChainId, SchemaType>> => [
    {
        rules: [
            {
                key: 'token',
                type: 'exact',
                filter: (data: SearchResult<ChainId, SchemaType>, keyword: string) => {
                    if (data.type !== SearchResultType.FungibleToken) return false

                    if (
                        data.alias
                            ?.filter((x) => !x.isPin)
                            .map((x) => x.value.toLowerCase())
                            .includes(keyword.toLowerCase())
                    )
                        return true

                    const symbol = data.symbol
                    if (symbol === keyword || symbol.replaceAll(/\s/gu, '') === keyword) return true

                    const name = data.name
                    if (name === keyword) return true

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
                        all
                            .filter((x) => x.alias?.length && x.type === SearchResultType.FungibleToken)
                            .flatMap((x) => {
                                return x.alias
                                    ?.filter((x) => x.isPin)
                                    .map((y) => {
                                        return {
                                            ...x,
                                            __alias: y.value,
                                        }
                                    })
                            }),
                    )

                    return new Fuse(data, {
                        keys: [{ name: '__alias', weight: 0.5 }],
                        isCaseSensitive: false,
                        ignoreLocation: true,
                        shouldSort: true,
                        threshold: 0,
                        minMatchCharLength: 5,
                    })
                        .search(keyword)
                        .map((x) => data[x.refIndex])
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
                                __symbol: x.symbol?.replace(/\s/gu, ''),
                                __name: x.name?.replace(/\s/gu, ''),
                            }
                        }),
                    )

                    return new Fuse(data, {
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
                        .search(keyword)
                        .map((x) => all[x.refIndex])
                },
            },
        ],
        types: [SearchResultType.FungibleToken],
    },
]
