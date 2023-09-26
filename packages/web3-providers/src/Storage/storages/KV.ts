import { LRUCache } from 'lru-cache'
import { R2D2GetterSetter } from '../libs/R2D2.js'
import type { StorageAPI } from '../../entry-types.js'

const caches = new Map<string, LRUCache<string, any>>()

export class KVStorage implements StorageAPI.Storage {
    private cache: LRUCache<string, any> | undefined

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
        return new R2D2GetterSetter<T>(this.namespace)
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string) {
        const cacheKey = `${this.namespace}_${key}`
        const cache = this.cache?.get(cacheKey)
        const storage = cache ?? this.getKV<T>().get(key)
        return storage as T | undefined
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
