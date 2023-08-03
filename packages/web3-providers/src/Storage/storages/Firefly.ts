import { LRUCache } from 'lru-cache'
import { SignType } from '@masknet/shared-base'
import { FireflyGetterSetter } from '../libs/Firefly.js'
import { ConnectionAPI } from '../../Web3/EVM/apis/ConnectionAPI.js'
import type { StorageAPI } from '../../entry-types.js'

const caches = new Map<string, LRUCache<string, any>>()

export class FireflyStorage implements StorageAPI.Storage {
    private Firefly = new FireflyGetterSetter()
    private Web3 = new ConnectionAPI()

    private cache: LRUCache<string, any> | undefined

    constructor(
        private namespace: string,
        private address: string,
    ) {
        const cache = caches.get(this.getKey())
        if (cache) {
            this.cache = cache
            return
        } else {
            const lru = new LRUCache<string, any>({
                max: 500,
                ttl: 60_000,
            })

            caches.set(this.getKey(), lru)
            this.cache = lru
        }
    }

    private getKey() {
        return `${this.namespace}-${this.address}`
    }

    async get<T>(key: string) {
        const cacheKey = `${this.getKey()}-${key}`
        let value = this.cache?.get(cacheKey)
        if (value) return value as T
        value = await this.Firefly.get(this.namespace, key, this.address)
        this.cache?.set(cacheKey, value)
        return value as T
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async set<T>(key: string, value: T) {
        const signature = await this.Web3.signMessage(SignType.Message, JSON.stringify(value))
        if (!signature) throw new Error('Failed to sign payload')
        await this.Firefly.set(this.namespace, key, this.address, value as string, signature)
        const cacheKey = `${this.getKey()}-${key}`
        this.cache?.delete(cacheKey)
        return
    }
}
