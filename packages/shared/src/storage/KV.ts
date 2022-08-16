import { KeyValue } from '@masknet/web3-providers'
import type { Storage } from '@masknet/web3-shared-base'
import LRU from 'lru-cache'

const caches = new Map<string, LRU<string, unknown>>()

export class KVStorage implements Storage {
    private cache: LRU<string, unknown> | undefined

    constructor(private namespace: string) {
        const cache = caches.get(namespace)
        if (cache) {
            this.cache = cache
            return
        } else {
            const lru = new LRU<string, unknown>({
                max: 500,
                ttl: 60_000,
            })

            caches.set(namespace, lru)
            this.cache = lru
        }
    }

    private getKV<T>() {
        return KeyValue.createJSON_Storage<T>(this.namespace)
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string) {
        const cacheKey = `${this.namespace}_${key}`
        const cache = this.cache?.get<T>(cacheKey)

        return cache ?? this.getKV<T>().get(key)
    }

    async set<T>(key: string, value: T) {
        await this.getKV<T>().set(key, value)

        // clear cache when set
        this.delete(key)

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
