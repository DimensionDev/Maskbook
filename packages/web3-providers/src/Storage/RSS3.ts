import { LRUCache } from 'lru-cache'
import type { Storage } from '@masknet/web3-shared-base'
import type { Web3Connection } from '@masknet/web3-shared-evm'
import { RSS3API } from '../RSS3/index.js'

const caches = new Map<string, LRUCache<string, any>>()

export class RSS3Storage implements Storage {
    private RSS3 = new RSS3API()
    private cache: LRUCache<string, any> | undefined

    constructor(private address: string, private getConnection?: () => Web3Connection | undefined) {
        const cache = caches.get(address)
        if (cache) {
            this.cache = cache
            return
        } else {
            const lru = new LRUCache<string, any>({
                max: 500,
                ttl: 60_000,
            })

            caches.set(address, lru)
            this.cache = lru
        }
    }

    private async getRSS3<T>() {
        const connection = this.getConnection?.()
        return this.RSS3.createRSS3(
            this.address,
            connection
                ? (message: string) => connection.signMessage('message', message, { account: this.address })
                : undefined,
        )
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string): Promise<T | undefined> {
        const cacheKey = `${this.address}_${key}`
        const rss3 = await this.getRSS3<T>()
        const cache = this.cache?.get(cacheKey)
        return cache ?? this.RSS3.getFileData(rss3, this.address, key)
    }

    async set<T>(key: string, value: T) {
        const rss3 = await this.getRSS3<T>()
        await this.RSS3.setFileData<T>(rss3, this.address, key, value)

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
