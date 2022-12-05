import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult, SearchSourceType, SourceType } from '@masknet/web3-shared-base'
import Fuse from 'fuse.js'
import get from 'lodash-es/get.js'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers.js'
import type { DSearchBaseAPI } from '../entry-types.js'

const DSearchDataURL = 'http://mask.io'

export interface FungibleToken {
    id: string | number
    name: string
    symbol: string
    provider: SourceType
}
export interface NonFungibleCollectionRemote {
    chainId: string
    name: string
    slug?: string
    symbol?: string
    description?: string
    address?: string
    iconURL?: string | null
    /** the amount of mint tokens */
    tokensTotal?: number
    /** the amount of holders */
    ownersTotal?: number
    /** verified by provider */
    verified?: boolean
    /** unix timestamp */
    createdAt?: number
    /** source type */
    source?: SourceType
    socialLinks: {
        website?: string
        email?: string
        twitter?: string
        discord?: string
        telegram?: string
        github?: string
        instagram?: string
        medium?: string
    }
}

export type Resource = FungibleToken | NonFungibleCollectionRemote

type rule = {
    key: string
    type: 'exact' | 'fuzzy'
    filter?: (data: Resource, keyword: string, all: Resource[]) => boolean
    fullSearch?: (keyword: string, all: Resource[]) => Resource[]
}
type handler = {
    rules: rule[]
    dataProvider: () => Promise<Resource[]>
}

const specificTokens = urlcat(DSearchDataURL, '/output/fungible-tokens/specific-list.json')
const tokenURL1 = urlcat(DSearchDataURL, '/output/fungible-tokens/coin-geoko.json')
const tokenURL2 = urlcat(DSearchDataURL, '/output/fungible-tokens/coinmarketcap.json')
const nftList = urlcat(DSearchDataURL, '/output/non-fungible-tokens/nftscan.json')
const collectionList = urlcat(DSearchDataURL, '/output/non-fungible-collections/nftscan.json')

// "token:eth"
// "collection:punk"
// "twitter:mask"
// "address:0x..."
export class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll>
    implements DSearchBaseAPI.Provider<ChainId, SchemaType>
{
    async initCache() {
        const requests = [specificTokens, tokenURL1, tokenURL2, nftList, collectionList]
        await Promise.allSettled(requests)
    }
    // fuzzy

    private resourceHandlers: handler[] = [
        {
            rules: [
                {
                    key: 'address',
                    type: 'exact',
                    filter: (data: Resource, keyword: string, all: Resource[]) => {
                        const value = get(data, 'address')
                        return value === keyword
                    },
                },
            ],
            dataProvider: this.getAddressResult,
        },
        {
            rules: [
                {
                    key: 'token',
                    type: 'exact',
                    filter: (data: Resource, keyword: string, all: Resource[]) => {
                        const symbol = get(data, 'symbol')
                        if (symbol === keyword || symbol?.replace(/\s/g, '') === keyword) return true

                        const name = get(data, 'name')
                        if (name === keyword) return true

                        return false
                    },
                },
                {
                    key: 'token',
                    type: 'fuzzy',
                    fullSearch: (keyword: string, all: Resource[]) => {
                        const data = all.map((x) => ({
                            ...x,
                            sSymbol: x.symbol?.replace(/\s/g, ''),
                            sName: x.name?.replace(/\s/g, ''),
                        }))
                        console.log(data)

                        const fuse = new Fuse(data, {
                            keys: [
                                { name: 'symbol', weight: 0.5 },
                                { name: 'sSymbol', weight: 0.4 },
                                { name: 'sName', weight: 0.4 },
                                { name: 'name', weight: 0.3 },
                            ],
                            isCaseSensitive: false,
                            ignoreLocation: true,
                            shouldSort: true,
                            threshold: 0,
                            minMatchCharLength: 5,
                        })
                        console.log(fuse.search(keyword).map((x) => x.refIndex))

                        return fuse.search(keyword).map((x) => all[x.refIndex])
                    },
                },
            ],
            dataProvider: this.getFungibleTokenResult,
        },
    ]

    private async getAddressResult(): Promise<Resource[]> {
        return []
    }
    private async getDomainResult() {
        return []
    }
    private async getFungibleTokenResult(): Promise<Resource[]> {
        const specificList = await fetchJSON<FungibleToken[]>(specificTokens)
        const tokenList1 = await fetchJSON<FungibleToken[]>(tokenURL1)
        const tokenList2 = await fetchJSON<FungibleToken[]>(tokenURL2)

        return (await Promise.allSettled([specificList, tokenList1, tokenList2]))
            .map((v) => (v.status === 'fulfilled' && v.value ? v.value : []))
            .flat()
    }

    private async getNonFungibleTokenResult() {
        return []
    }
    private async getNonFungibleCollectionResult(keyword: string, field?: string) {
        const allCollection = await fetchJSON<NonFungibleCollectionRemote[]>(collectionList)
        return []
    }

    private parseKeywork(keywork: string): { word: string; field?: string } {
        const works = keywork.split(':')
        if (works.length === 1) {
            return {
                word: works[0],
            }
        }
        return {
            word: works[1],
            field: works[0],
        }
    }

    async search(keyword: string, sourceType?: SearchSourceType): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { word, field } = this.parseKeywork(keyword)
        console.log(word)
        console.log(field)

        const result: Array<SearchResult<ChainId, SchemaType>> = []

        for (const searcher of this.resourceHandlers) {
            const { dataProvider, rules } = searcher

            const data = await dataProvider()
            for (const rule of rules) {
                if (field !== undefined && rule.key !== field) continue
                console.log(rule.type)

                if (rule.type === 'exact') {
                    const items = data.filter((x) => rule.filter?.(x, word, data))
                    if (items.length) return items
                }
                if (rule.type === 'fuzzy') {
                    const items = rule.fullSearch?.(word, data) ?? []
                    if (items.length) return items
                }
            }
        }

        return result
    }
}
