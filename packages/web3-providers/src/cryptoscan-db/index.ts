import type { ScamWarningAPI } from '../types/ScamWarning.js'
import LRUCache from 'lru-cache'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers.js'

const cache = new LRUCache<string, OnlineCategory[] | ScamWarningAPI.Info[] | ScamWarningAPI.Info>({
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

const baseURL =
    'https://raw.githubusercontent.com/DimensionDev/Mask-Scam-List/feat/fetch-cryptoscan-db-data/providers/cryptoscan-db'

export class CryptoscanDbAPI implements ScamWarningAPI.Provider {
    async getCategories() {
        const categoriesCacheKey = 'site-categories'
        const inCache = cache.get<OnlineCategory[]>(categoriesCacheKey)
        if (inCache) return inCache

        const categories = await fetchJSON<OnlineCategory[]>(urlcat(baseURL, 'categories.json'))

        cache.set(categoriesCacheKey, categories)
        return categories
    }

    async getSubCategories() {
        const categoriesCacheKey = 'site-sub-categories'
        const inCache = cache.get<OnlineCategory[]>(categoriesCacheKey)
        if (inCache) return inCache

        const categories = await fetchJSON<OnlineCategory[]>(urlcat(baseURL, 'sub-categories.json'))

        cache.set(categoriesCacheKey, categories)
        return categories
    }

    async getSiteList() {
        const listCacheKey = 'site-list'
        const inCache = cache.get<ScamWarningAPI.Info[]>(listCacheKey)
        if (inCache) return inCache

        const categories = await this.getCategories()
        const subCategories = await this.getSubCategories()

        const result = await fetchJSON<OnlineInfo[]>(urlcat(baseURL, 'list.json'))
        const infos = result.map((x) => {
            return {
                ...x,
                category: categories.find((c) => c.id === x.category)?.value,
                subcategory: categories.find((c) => c.id === x.subcategory)?.value,
            }
        })
        cache.set('site-list', infos)

        return infos
    }

    async getScamWarning(key: string): Promise<ScamWarningAPI.Info | undefined> {
        const cacheKey = `site-${key}`
        const cacheSite = cache.get<ScamWarningAPI.Info>(cacheKey)
        if (cacheSite) return cacheSite

        const list = await this.getSiteList()
        if (!list) return

        return list.find((x) => x.name.toLowerCase() === key.toLowerCase())
    }

    async getScamWarnings(keys: string[]): Promise<ScamWarningAPI.Info[] | undefined> {
        const cacheKey = `site-${keys.join('-')}`
        const cacheSite = cache.get<ScamWarningAPI.Info[]>(cacheKey)
        if (cacheSite) return cacheSite

        const categories = await this.getCategories()
        const subCategories = await this.getSubCategories()
        const list = await this.getSiteList()
        if (!list) return

        return keys
            .map((x) => list.find((c) => c.name.toLowerCase() === x.toLowerCase()))
            .filter(Boolean) as ScamWarningAPI.Info[]
    }
}
