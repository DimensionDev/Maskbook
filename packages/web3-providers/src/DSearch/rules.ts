import { compact } from 'lodash-es'
import { isSameAddress, SearchResult, SearchResultType } from '@masknet/web3-shared-base'
import type { Handler } from './type.js'
import { FuseAPI } from '../Fuse/index.js'

const Fuse = new FuseAPI()

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
                    if (symbol === keyword || symbol?.replace(/\s/g, '') === keyword) return true

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

                    return Fuse.create(data, {
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
                                __symbol: x.symbol?.replace(/\s/g, ''),
                                __name: x.name?.replace(/\s/g, ''),
                            }
                        }),
                    )

                    return Fuse.create(data, {
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
                        Boolean(
                            data.alias
                                ?.filter((x) => !x.isPin)
                                ?.map((x) => x.value.toLowerCase())
                                .includes(keyword.toLowerCase()),
                        )
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
                        all
                            .filter(
                                (x) => x.alias?.length && x.type === SearchResultType.CollectionListByTwitterHandler,
                            )
                            .flatMap((x) => {
                                // Make ts work
                                if (x.type !== SearchResultType.CollectionListByTwitterHandler) return []
                                return x.alias
                                    ?.filter((x) => x.isPin)
                                    .map((y) => {
                                        return {
                                            ...x,
                                            __name: x.name?.replace(/\s/g, ''),
                                            __alias: y.value,
                                        }
                                    })
                            }),
                    )

                    return Fuse.create(data, {
                        keys: [
                            { name: '__alias', weight: 0.5 },
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
                            if (x.type !== SearchResultType.NonFungibleToken) return
                            return {
                                ...x,
                                __name: x.name?.replace(/\s/g, ''),
                            }
                        }),
                    )

                    return Fuse.create(data, {
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
                        .search(keyword)
                        .map((x) => all[x.refIndex])
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
                    if (data.type !== SearchResultType.CollectionListByTwitterHandler) return false
                    return Boolean(data.collection?.socialLinks?.twitter?.toLowerCase().endsWith(keyword.toLowerCase()))
                },
            },
        ],
        type: SearchResultType.CollectionListByTwitterHandler,
    },
]
