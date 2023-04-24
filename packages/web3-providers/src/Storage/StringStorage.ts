import { LRUCache } from 'lru-cache'
import type { Storage } from '@masknet/web3-shared-base'
import { SignType } from '@masknet/shared-base'
import type { Web3Connection } from '@masknet/web3-shared-evm'
import { StringStorageAPI } from '../StringStorage/index.js'

const caches = new Map<string, LRUCache<string, any>>()

export class StringStorage implements Storage {
    private cache: LRUCache<string, any> | undefined
    private stringStorage = new StringStorageAPI()
    constructor(
        private namespace: string,
        private address: string,
        private getConnection?: () => Web3Connection | undefined,
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
        value = await this.stringStorage.get(this.namespace, key, this.address)
        this.cache?.set(cacheKey, value)
        return value as T
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async set<T>(key: string, value: T) {
        const connection = this.getConnection?.()
        const signature = await connection?.signMessage(SignType.Message, JSON.stringify(value))
        if (!signature) throw new Error('Failed to sign payload')
        await this.stringStorage.set(this.namespace, key, this.address, value as string, signature)
        const cacheKey = `${this.getKey()}-${key}`
        this.cache?.delete(cacheKey)
        return
    }
}
