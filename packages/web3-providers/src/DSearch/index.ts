import type {
    FungibleTokenResult,
    NonFungibleCollectionResult,
    NonFungibleTokenResult,
    SearchResult,
} from '@masknet/web3-shared-base'
import urlcat from 'urlcat'
import { CoinGeckoSearchAPI } from '../CoinGecko/apis/DSearchAPI.js'
import { CoinMarketCapSearchAPI } from '../CoinMarketCap/DSearchAPI.js'
import { fetchJSON } from '../helpers.js'
import { NFTSCANDSearchAPI } from '../NFTScan/index.js'
import type { DSearchBaseAPI } from '../types/DSearch.js'
import { getHandlers } from './rules.js'
import type { handler } from './type.js'

const BASE_URL = 'http://mask.io'

export class DSearchAPI<ChainId, SchemaType> implements DSearchBaseAPI.Provider<ChainId, SchemaType> {
    handlers: Array<handler<ChainId, SchemaType>>

    NFTScanClient: DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType>
    CoinGeckoClient: DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType>
    CoinMarketCapClient: DSearchBaseAPI.DataSourceProvider<ChainId, SchemaType>

    constructor() {
        this.handlers = getHandlers<ChainId, SchemaType>()
        this.NFTScanClient = new NFTSCANDSearchAPI<ChainId, SchemaType>()
        this.CoinGeckoClient = new CoinGeckoSearchAPI<ChainId, SchemaType>()
        this.CoinMarketCapClient = new CoinMarketCapSearchAPI<ChainId, SchemaType>()
    }

    private async init() {
        const tokenSpecificList = urlcat(BASE_URL, '/output/fungible-tokens/specific-list.json')
        const nftSpecificList = urlcat(BASE_URL, '/output/non-fungible-tokens/specific-list.json')
        const collectionSpecificList = urlcat(BASE_URL, '/output/non-fungible-collections/specific-list.json')

        const tokensRequest = fetchJSON<Array<FungibleTokenResult<ChainId, SchemaType>>>(tokenSpecificList)
        const nftsRequest = fetchJSON<Array<NonFungibleTokenResult<ChainId, SchemaType>>>(nftSpecificList)
        const collectionsRequest =
            fetchJSON<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(collectionSpecificList)

        const NFTScanRequest = this.NFTScanClient.get()
        const CoinGeckoRequest = this.CoinGeckoClient.get()
        const CoinMarketCapRequset = this.CoinMarketCapClient.get()

        return (
            await Promise.allSettled([
                tokensRequest,
                nftsRequest,
                collectionsRequest,
                NFTScanRequest,
                CoinMarketCapRequset,
                CoinGeckoRequest,
            ])
        )
            .map((v) => (v.status === 'fulfilled' && v.value ? v.value : []))
            .flat()
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

    /**
     *
     * Search DSearch info
     * @param keywork A hint for searching the localKey.
     * @returns SearchResult List
     *
     * params e.g.
     * "eth"
     * "token:eth"
     * "collection:punk"
     * "twitter:mask"
     * "addrsss:0x"
     *
     */
    async search(keyword: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { word, field } = this.parseKeywork(keyword)
        const data = await this.init()

        let result: Array<SearchResult<ChainId, SchemaType>> = []

        for (const searcher of this.handlers) {
            const { rules, type } = searcher

            for (const rule of rules) {
                if (field !== undefined && rule.key !== field) continue
                const filtered = data.filter((x) => (type ? type === x.type : true))

                if (rule.type === 'exact') {
                    const items = filtered.find((x) => rule.filter?.(x, word, filtered))
                    if (items) {
                        if (!field) {
                            result = [...result, items]
                        } else {
                            return [items]
                        }
                    }
                }
                if (rule.type === 'fuzzy') {
                    const items = rule.fullSearch?.(word, filtered) ?? []
                    if (!field) {
                        result = [...result, ...items]
                    } else {
                        if (items.length) return items
                    }
                }
            }
        }

        return result
    }
}
