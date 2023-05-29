import urlcat from 'urlcat'
import { has } from 'lodash-es'
import { Flags } from './Flags.js'

interface FetchResult<T extends Record<string, unknown>> {
    flags?: T
    timestamp: number
}

export class RemoteFlags<T extends Record<string, unknown>> extends Flags<T> {
    private readonly KEY = 'mask-last-fetch-result'

    private lastFetchResult: FetchResult<T> | null = null

    private get lastStorageResult() {
        try {
            const json = localStorage.getItem(this.KEY)
            const result: FetchResult<T> | null = json ? JSON.parse(json) : null
            return result
        } catch (error) {
            return null
        }
    }

    constructor(
        private remoteFlagsURL: string,
        defaults: T,
        private initials?: {
            // the valid duration for remote fetched flags
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

    override get accessor(): Readonly<T> {
        return new Proxy(this.defaults, {
            get: (target, key, receiver) => {
                if (has(this.lastFetchResult?.flags, key)) return this.lastFetchResult?.flags?.[key as string]
                return Reflect.get(target, key, receiver)
            },
            set: (target, key, value, receiver) => {
                throw new Error('Not allowed')
            },
        })
    }

    /**
     * Sync with the local storage.
     */
    sync() {
        if (!this.isLastStorageResultFresh) {
            try {
                localStorage.removeItem(this.KEY)
            } catch {}
        }

        const lastFetchResult = this.lastFetchResult
        const lastStorageResult = this.lastStorageResult

        if (
            (lastFetchResult?.timestamp && !lastStorageResult?.timestamp) ||
            (lastFetchResult?.timestamp &&
                lastStorageResult?.timestamp &&
                lastStorageResult.timestamp < lastFetchResult.timestamp)
        ) {
            console.log('[RemoteFlags] sync from remote')
            try {
                localStorage.setItem(this.KEY, JSON.stringify(lastFetchResult))
            } catch {}
        } else if (lastStorageResult?.timestamp) {
            console.log('[RemoteFlags] sync from storage')
            this.lastFetchResult = lastStorageResult
        }
    }

    /**
     * Fetch flags from the remote server.
     */
    async fetch() {
        const response = await fetch(
            urlcat(this.remoteFlagsURL, {
                engine: process.env.engine,
                channel: process.env.channel,
                manifest: process.env.manifest,
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
        if (this.isLastFetchResultFresh) return

        this.lastFetchResult = {
            flags: await this.fetch(),
            timestamp: Date.now(),
        }
        this.sync()
    }
}
