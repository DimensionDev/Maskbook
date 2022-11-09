import type { ScamWarningAPI } from '../types/ScamWarning.js'
import LRUCache from 'lru-cache'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers.js'
import { ScalableBloomFilter } from 'bloom-filters'

const cache = new LRUCache<string, JSON | ScamWarningAPI.Info>({
    max: 100,
    ttl: 300_000,
})

interface OnlineCategory {
    id: number
    value: string
}

export interface OnlineInfo {
    name: string
    url: string
    path?: string
    category?: number
    subcategory?: number
    description: string
}

const baseURL = 'https://raw.githubusercontent.com/DimensionDev/Mask-Scam-List/main/providers/cryptoscan-db/'

export class CryptoScanDbAPI implements ScamWarningAPI.Provider {
    bloomFilter?: ScalableBloomFilter

    async getBloomFilter() {
        if (this.bloomFilter) return this.bloomFilter
        const categoriesCacheKey = 'filter-config'
        const filterConfigCache = cache.get<JSON>(categoriesCacheKey)

        if (filterConfigCache) {
            this.bloomFilter = ScalableBloomFilter.fromJSON(filterConfigCache) as ScalableBloomFilter
            return this.bloomFilter
        }

        const filter = await fetchJSON<JSON>(urlcat(baseURL, 'filter/config.json'))
        cache.set(categoriesCacheKey, filter)

        this.bloomFilter = ScalableBloomFilter.fromJSON(filter)
        return this.bloomFilter as ScalableBloomFilter
    }

    async getScamWarning(key: string): Promise<ScamWarningAPI.Info | undefined> {
        const cacheKey = `site-${key}`
        const cacheSite = cache.get<ScamWarningAPI.Info>(cacheKey)
        if (cacheSite) return cacheSite

        const filter = await this.getBloomFilter()
        if (!filter.has(key)) return

        return fetchJSON<ScamWarningAPI.Info>(urlcat(baseURL, `${key}.json`))
    }

    async getScamWarnings(keys: string[]): Promise<ScamWarningAPI.Info[] | undefined> {
        const requests = keys.map((x) => this.getScamWarning(x))
        const result = await Promise.allSettled(requests)
        return result
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter((x): x is ScamWarningAPI.Info => !!x)
    }
}
