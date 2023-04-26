import { LRUCache } from 'lru-cache'
import { R2D2KeyValueAPI } from '../R2D2/index.js'
import type { Storage } from '@masknet/web3-shared-base'

const caches = new Map<string, LRUCache<string, any>>()

export class KVStorage implements Storage {
    private cache: LRUCache<string, any> | undefined
    private keyValue = new R2D2KeyValueAPI()

    constructor(private namespace: string) {
        const cache = caches.get(namespace)
        if (cache) {
            this.cache = cache
            return
        } else {
            const lru = new LRUCache<string, any>({
                max: 500,
                ttl: 60_000,
            })

            caches.set(namespace, lru)
            this.cache = lru
        }
    }

    private getKV<T>() {
        return this.keyValue.createJSON_Storage<T>(this.namespace)
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string) {
        const cacheKey = `${this.namespace}_${key}`
        const cache = this.cache?.get(cacheKey)

        return cache ?? this.getKV<T>().get(key)
    }

    async set<T>(key: string, value: T) {
        await this.getKV<T>().set(key, value)

        // clear cache when set
        await this.delete(key)

        return
    }

    async delete(key: string) {
        const cacheKey = `${this.namespace}_${key}`
        this.cache?.delete(cacheKey)
    }

    async clearAll() {
        this.cache?.clear()
    }
}
