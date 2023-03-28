import urlcat from 'urlcat'
import { get, has } from 'lodash-es'
import { Flags } from './Flags.js'

interface FetchResult<T extends object> {
    flags?: T
    timestamp: number
}

export class RemoteFlags<T extends object> extends Flags<T> {
    private readonly KEY = 'mask-last-fetch-result'

    private lastFetchResult: FetchResult<T> | null = null

    private get lastStorageResult() {
        const json = localStorage.getItem(this.KEY)
        const result: FetchResult<T> | null = json ? JSON.parse(json) : null
        return result
    }

    constructor(
        private remoteFlagsURL: string,
        defaults: T,
        private initials?: {
            // this time to live duration for remote flags
            fetchTTL?: number
            // the valid duration for local storage flags
            storageTTL?: number
        },
    ) {
        super(defaults)

        this.sync()
    }

    get options() {
        return {
            fetchTTL: 60 * 60 * 1000, // 1hr
            storageTTL: 2 * 60 * 60 * 1000, // 2hr
            ...this.initials,
        }
    }

    get isLastFetchResultFresh() {
        return Date.now() - this.lastFetchTimestamp < this.options.fetchTTL
    }

    get isLastStorageResultFresh() {
        return Date.now() - this.lastStorageTimestamp < this.options.storageTTL
    }

    get lastFetchTimestamp() {
        return this.lastFetchResult?.timestamp ?? 0
    }

    get lastStorageTimestamp() {
        return this.lastStorageResult?.timestamp ?? 0
    }

    override get accessor() {
        const lastFetchResult = this.lastFetchResult

        return new Proxy(this.defaults, {
            get(target, key, receiver) {
                if (has(lastFetchResult?.flags, key)) return get(lastFetchResult?.flags, key)
                return super.accessor[key]
            },
            set(target, key, value, receiver) {
                throw new Error('Not allowed')
            },
        })
    }

    /**
     * Sync with the local storage.
     */
    sync() {
        if (!this.isLastStorageResultFresh) {
            localStorage.removeItem(this.KEY)
        }

        const lastFetchResult = this.lastFetchResult
        const lastStorageResult = this.lastStorageResult

        if (
            lastFetchResult?.timestamp &&
            lastStorageResult?.timestamp &&
            lastStorageResult.timestamp < lastFetchResult.timestamp
        ) {
            localStorage.setItem(this.KEY, JSON.stringify(lastFetchResult))
        } else if (lastStorageResult?.timestamp) {
            this.lastFetchResult = lastStorageResult
        }
    }

    /**
     * Fetch flags from the remote server.
     */
    async fetch() {
        const response = await fetch(
            urlcat(this.remoteFlagsURL, {
                architecture: process.env.architecture,
                channel: process.env.channel,
                engine: process.env.engine,
                NODE_ENV: process.env.NODE_ENV,
            }),
        )
        const flags: T = await response.json()
        return flags
    }

    /**
     * Fetch flags from the remote server and patch updates right after fetched.
     */
    async fetchAndActive() {
        // Prevent fetching too frequently
        if (!this.isLastFetchResultFresh) return

        this.lastFetchResult = {
            flags: await this.fetch(),
            timestamp: Date.now(),
        }
        this.sync()
    }
}
