import type { ScamWarningAPI } from '../types/ScamWarning.js'
import LRUCache from 'lru-cache'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers.js'

const cache = new LRUCache<string, OnlineCategory[] | ScamWarningAPI.Info[] | ScamWarningAPI.Info>({
    ttl: 300_000,
})

interface OnlineCategory {
    id: number
    value: string
}

const baseURL =
    'https://github.com/DimensionDev/Mask-Scam-List/blob/feat/fetch-cryptoscan-db-data/providers/cryptoscan-db/'

export class CryptoscanDbAPI implements ScamWarningAPI.Provider {
    async getCategories() {
        const categoriesCacheKey = 'site-categories'
        const inCache = cache.get(categoriesCacheKey)
        if (inCache) return inCache

        const categories = await fetchJSON<OnlineCategory[]>(urlcat(baseURL, 'categories.json'))

        cache.set(categoriesCacheKey, categories)
        return categories
    }

    async getSubCategories() {
        const categoriesCacheKey = 'site-sub-categories'
        const inCache = cache.get(categoriesCacheKey)
        if (inCache) return inCache

        const categories = await fetchJSON<OnlineCategory[]>(urlcat(baseURL, 'sub-categories.json'))

        cache.set(categoriesCacheKey, categories)
        return categories
    }

    async getSiteList() {
        const listCacheKey = 'site-list'
        const inCache = cache.get<ScamWarningAPI.Info[]>(listCacheKey)
        if (inCache) return inCache

        const result = await fetchJSON<ScamWarningAPI.Info[]>(urlcat(baseURL, 'list.json'))
        cache.set('site-list', result)

        return result
    }

    async getScamWarning(key: string): Promise<ScamWarningAPI.Info | undefined> {
        const cacheKey = `site-${key}`
        const cacheSite = cache.get<ScamWarningAPI.Info>(cacheKey)
        if (cacheSite) return cacheSite

        const categories = await this.getCategories()
        const subCategories = await this.getSubCategories()
        const list = await this.getSiteList()
        if (!list) return

        return list.find((x) => x.name.toLowerCase() === key.toLowerCase())
    }
}
