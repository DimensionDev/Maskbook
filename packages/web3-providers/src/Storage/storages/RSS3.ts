import { LRUCache } from 'lru-cache'
import { RSS3 } from '../../RSS3/index.js'
import { ConnectionAPI } from '../../Web3/EVM/apis/ConnectionAPI.js'
import type { StorageAPI } from '../../entry-types.js'

const caches = new Map<string, LRUCache<string, any>>()

export class RSS3Storage implements StorageAPI.Storage {
    private Web3 = new ConnectionAPI()

    private cache: LRUCache<string, any> | undefined

    constructor(private address: string) {
        const cache = caches.get(address)

        if (cache) {
            this.cache = cache
        } else {
            const lru = new LRUCache<string, any>({
                max: 500,
                ttl: 60_000,
            })

            caches.set(address, lru)
            this.cache = lru
        }
    }

    private async getRSS3() {
        return RSS3.createRSS3(this.address, (message: string) =>
            this.Web3.signMessage('message', message, { account: this.address }),
        )
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string): Promise<T | undefined> {
        const cacheKey = `${this.address}_${key}`
        const rss3 = await this.getRSS3()
        const cache = this.cache?.get(cacheKey)
        return cache ?? RSS3.getFileData(rss3, this.address, key)
    }

    async set<T>(key: string, value: T) {
        const rss3 = await this.getRSS3()
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
