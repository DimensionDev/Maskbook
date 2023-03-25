import LRU from 'lru-cache'
import type { Storage } from '@masknet/web3-shared-base'
import { Firefly } from '@masknet/web3-providers'
import { type NetworkPluginID, SignType, getSiteType } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

const caches = new Map<string, LRU<string, unknown>>()

export class FireflyStorage implements Storage {
    private cache: LRU<string, unknown> | undefined

    constructor(
        private namespace: string,
        private userId: string,
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
        return `${this.namespace}-${getSiteType()}-${this.userId}-${this.address}`
    }

    async get<T>(key: string) {
        let value = this.cache?.get(key)
        if (value) return value as T
        value = await Firefly.get<T>(this.namespace, this.userId, this.address)
        this.cache?.set(key, value)
        return value as T
    }

    async getData<T>() {
        return this.get<T>(this.getKey())
    }

    async has() {
        return !!this.getData()
    }

    async set<T>(key: string, value: T) {
        const connection = this.getConnection?.()
        const signature = await connection?.signMessage(SignType.Message, JSON.stringify(value))
        if (!signature) throw new Error('Failed to sign payload')
        await Firefly.set<T>(this.namespace, this.userId, this.address, value, signature)
        this.cache?.delete(key)
        return
    }

    async setData<T>(value: T) {
        await this.set<T>(this.getKey(), value)
    }
}
