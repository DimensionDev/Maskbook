import type { Storage } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { RSS3 } from '@masknet/web3-providers'
import LRU from 'lru-cache'

const caches = new Map<string, LRU<string, unknown>>()
export class RSS3Storage implements Storage {
    private cache: LRU<string, unknown> | undefined
    constructor(
        private address: string,
        private getConnection?: () => Promise<Web3Helper.Web3Connection<NetworkPluginID>> | undefined,
    ) {
        const cache = caches.get(address)
        if (cache) {
            this.cache = cache
            return
        } else {
            const lru = new LRU<string, unknown>({
                max: 500,
                ttl: 60_000,
            })

            caches.set(address, lru)
            this.cache = lru
        }
    }

    private async getRSS3<T>() {
        const connection = await this.getConnection?.()
        return RSS3.createRSS3(
            this.address,
            connection
                ? (message: string) => connection.signMessage(message, 'personalSign', { account: this.address })
                : undefined,
        )
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string): Promise<T | undefined> {
        const cacheKey = `${this.address}_${key}`
        const rss3 = await this.getRSS3<T>()
        const cache = this.cache?.get<T>(cacheKey)
        return cache ?? RSS3.getFileData(rss3, this.address, key)
    }

    async set<T>(key: string, value: T) {
        const rss3 = await this.getRSS3<T>()
        await RSS3.setFileData<T>(rss3, this.address, key, value)

        this.delete(key)
        return
    }

    async delete(key: string) {
        const cacheKey = `${this.address}_${key}`

        this.cache?.delete(cacheKey)
    }

    async clearAll() {
        this.cache?.clear()
    }
}
