import type { Web3Helper } from '@masknet/web3-helpers'
import type {
    FungibleTokenResult,
    NonFungibleCollectionResult,
    NonFungibleTokenResult,
    SearchResult,
} from '@masknet/web3-shared-base'
import urlcat from 'urlcat'
import { CoinGeckoSearchAPI } from '../CoinGecko/apis/DSearchAPI.js'
import { CoinMarketCapSearchAPI } from '../CoinMarketCap/DSearchAPI.js'
import { fetchCached } from '../entry-helpers.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { NFTScanSearchAPI } from '../NFTScan/index.js'
import type { DSearchBaseAPI } from '../types/DSearch.js'
import { getHandlers } from './rules.js'

const BASE_URL = 'http://dsearch.mask.r2d2.to'

export class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll>
    implements DSearchBaseAPI.Provider<ChainId, SchemaType>
{
    handlers = getHandlers<ChainId, SchemaType>()

    NFTScanClient = new NFTScanSearchAPI<ChainId, SchemaType>()
    CoinGeckoClient = new CoinGeckoSearchAPI<ChainId, SchemaType>()
    CoinMarketCapClient = new CoinMarketCapSearchAPI<ChainId, SchemaType>()

    private async init() {
        const tokenSpecificList = urlcat(BASE_URL, '/fungible-tokens/specific-list.json')
        const nftSpecificList = urlcat(BASE_URL, '/non-fungible-tokens/specific-list.json')
        const collectionSpecificList = urlcat(BASE_URL, '/non-fungible-collections/specific-list.json')

        const tokensRequest = fetchJSON<Array<FungibleTokenResult<ChainId, SchemaType>>>(
            tokenSpecificList,
            undefined,
            fetchCached,
        )
        const nftsRequest = fetchJSON<Array<NonFungibleTokenResult<ChainId, SchemaType>>>(
            nftSpecificList,
            undefined,
            fetchCached,
        )
        const collectionsRequest = fetchJSON<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
            collectionSpecificList,
            undefined,
            fetchCached,
        )

        const NFTScanRequest = this.NFTScanClient.get()
        const CoinGeckoRequest = this.CoinGeckoClient.get()
        const CoinMarketCapRequest = this.CoinMarketCapClient.get()

        return (
            await Promise.allSettled([
                tokensRequest,
                nftsRequest,
                collectionsRequest,
                NFTScanRequest,
                CoinMarketCapRequest,
                CoinGeckoRequest,
            ])
        )
            .map((v) => (v.status === 'fulfilled' && v.value ? v.value : []))
            .flat()
    }

    private parseKeyword(keyword: string): { word: string; field?: string } {
        const works = keyword.split(':')
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
     * @param keyword A hint for searching the localKey.
     * @returns SearchResult List
     *
     * params e.g.
     * "eth"
     * "token:eth"
     * "collection:punk"
     * "twitter:mask"
     * "address:0x"
     *
     */
    async search(keyword: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { word, field } = this.parseKeyword(keyword)
        const data = await this.init()

        let result: Array<SearchResult<ChainId, SchemaType>> = []

        for (const searcher of this.handlers) {
            const { rules, type } = searcher

            for (const rule of rules) {
                if (field !== undefined && rule.key !== field) continue
                const filtered = data.filter((x) => (type ? type === x.type : true))

                if (rule.type === 'exact') {
                    const item = filtered.find((x) => rule.filter?.(x, word, filtered))
                    if (item) {
                        const exactData = { ...item, keyword: word }

                        if (!field) {
                            result = [...result, exactData]
                        } else {
                            return [exactData]
                        }
                    }
                }
                if (rule.type === 'fuzzy') {
                    const items = rule.fullSearch?.(word, filtered) ?? []
                    const fuzzyData = items.map((x) => ({ ...x, keyword: word }))
                    if (!field) {
                        result = [...result, ...fuzzyData]
                    } else {
                        if (items.length) return fuzzyData
                    }
                }
            }
        }

        return result
    }
}
