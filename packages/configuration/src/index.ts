import urlcat from 'urlcat'
import { DEFAULT_HOST, DEFAULT_PREFIX } from './constants'

class Configuration<T extends unknown> {
    private ac: AbortController | undefined

    constructor(private url: string, private data: T | undefined) {
        this.revalidate()
    }

    private async revalidate() {
        if (this.ac) this.ac.abort()
        this.ac = new AbortController()

        // TODO: delegate the fetch to the background.
        // because this DOES NOT work on Manifest V3 and Firefox.
        const response = await fetch(this.url, {
            signal: this.ac.signal,
        })
        this.data = (await response.json()) as T
    }

    get() {
        this.revalidate()
        return this.data
    }
}

const cache = new Map<string, Configuration<unknown>>()

export function create<T extends unknown>(name: string, prefix?: string, initialData?: T) {
    const url = urlcat(DEFAULT_HOST, prefix ? ':prefix.:name.json' : ':name.json', {
        name,
        prefix: prefix ?? DEFAULT_PREFIX,
    })
    if (!cache.has(url)) cache.set(url, new Configuration(url, initialData))
    return cache.get(url) as Configuration<T>
}
