import urlcat from 'urlcat'

interface FetchResult {
    flags?: object
    timestamp: number
}

export interface RemoteFlagsOptions {
    // the valid duration for remote fetched flags
    fetchTTL?: number
    // the valid duration for local storage flags
    storageTTL?: number
    KEY?: string
}

export class RemoteFlags<T extends object> {
    constructor(private remoteFlagsURL: string, private localFlags: T, options?: RemoteFlagsOptions) {
        const internalObject = (this.internalObject = Object.create(localFlags))
        this.flags = new Proxy(internalObject, {
            set: () => false,
            defineProperty: () => false,
            getPrototypeOf: () => null,
            setPrototypeOf: (t, v) => v === null,
        }) as T

        this.optionsFetchTTL = options?.fetchTTL ?? 60 * 60 * 1000
        this.optionsStorageTTL = options?.storageTTL ?? 2 * 60 * 60 * 1000
        this.KEY = options?.KEY ?? 'mask-last-fetch-result'

        this.sync()
    }
    flags: T
    private internalObject: object
    // options
    private optionsFetchTTL: number
    private optionsStorageTTL: number
    private KEY: string

    private lastFetchResult: FetchResult | null = null
    private get lastStorageResult(): FetchResult | null {
        try {
            // TODO: do not storage flags this.KEY in the localStorage
            const json = localStorage.getItem(this.KEY)
            if (!json) return null
            const obj = JSON.parse(json)
            if (!obj || typeof obj !== 'object') return null
            const { timestamp, flags } = obj as FetchResult
            if (typeof timestamp !== 'number' || (flags && typeof flags !== 'object')) return null
            return obj
        } catch {
            return null
        }
    }

    /**
     * Sync with the local storage.
     */
    private sync() {
        if (!this.isLastStorageResultFresh) {
            localStorage.removeItem(this.KEY)
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
            localStorage.setItem(this.KEY, JSON.stringify(lastFetchResult))
        } else if (lastStorageResult?.timestamp) {
            console.log('[RemoteFlags] sync from storage')
            this.lastFetchResult = lastStorageResult
        }

        Object.setPrototypeOf(
            this.internalObject,
            Object.freeze({
                ...this.lastFetchResult?.flags,
                [Symbol.toStringTag]: 'RemoteFlags',
                __proto__: this.localFlags,
            }),
        )
    }

    /**
     * Fetch flags from the remote server.
     */
    private async fetch(): Promise<object | undefined> {
        const response = await fetch(
            urlcat(this.remoteFlagsURL, {
                engine: process.env.engine,
                channel: process.env.channel,
                manifest: process.env.manifest,
                NODE_ENV: process.env.NODE_ENV,
            }),
        )
        const flags: T = await response.json()
        if (typeof flags !== 'object' || !flags) return undefined
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

    private get lastFetchTimestamp() {
        return this.lastFetchResult?.timestamp ?? 0
    }
    private get lastStorageTimestamp() {
        return this.lastStorageResult?.timestamp ?? 0
    }
    private get isLastFetchResultFresh() {
        return Date.now() - this.lastFetchTimestamp < this.optionsFetchTTL
    }
    private get isLastStorageResultFresh() {
        return Date.now() - this.lastStorageTimestamp < this.optionsStorageTTL
    }
}
