import LRU from 'lru-cache'
import type { Storage } from '@masknet/web3-shared-base'
import { type NetworkPluginID, SignType } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { StringStorage as StringStorageAPI } from '@masknet/web3-providers'

const caches = new Map<string, LRU<string, unknown>>()

export class StringStorage implements Storage {
    private cache: LRU<string, unknown> | undefined

    constructor(
        private namespace: string,
        private address: string,
        private getConnection?: () => Web3Helper.Web3Connection<NetworkPluginID> | undefined,
    ) {
        const cache = caches.get(this.getKey())
        if (cache) {
            this.cache = cache
            return
        } else {
            const lru = new LRU<string, unknown>({
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
        value = await StringStorageAPI.get(this.namespace, key, this.address)
        this.cache?.set(cacheKey, value)
        return value as T
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async set<T>(key: string, value: T) {
        const connection = this.getConnection?.()
        const signature = await connection?.signMessage(SignType.Message, value as string)
        if (!signature) throw new Error('Failed to sign payload')
        await StringStorageAPI.set(this.namespace, key, this.address, value as string, signature)
        const cacheKey = `${this.getKey()}-${key}`
        this.cache?.delete(cacheKey)
        return
    }
}
