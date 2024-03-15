import urlcat from 'urlcat'
import { env } from './buildInfo.js'

export interface IO {
    refetch(url: string): Promise<void>
    getCache(url: string): Promise<null | { response: string; time: number }>
}
export function createRemoteFlag<T extends object>(
    defaultFlags: T,
): readonly [T, (io: IO, signal?: AbortSignal, url?: string) => void] {
    // eslint-disable-next-line no-restricted-globals
    if (typeof localStorage === 'object') {
        // keep for a few releases, added in Nov 29 2023
        // eslint-disable-next-line no-restricted-globals
        localStorage.removeItem('mask-last-fetch-result')
    }
    const flags = Object.assign(Object.create(null), defaultFlags)
    const original = { ...flags }
    const flagProxy = new Proxy(flags, {
        set() {
            throw new TypeError('remote flag is readonly')
        },
        defineProperty() {
            throw new TypeError('remote flag is readonly')
        },
        deleteProperty() {
            throw new TypeError('remote flag is readonly')
        },
        setPrototypeOf(t, v) {
            return v === null
        },
    }) as T

    async function fetch(io: IO, signal?: AbortSignal, url = 'https://mask-flags.r2d2.to/') {
        url = urlcat(url, {
            channel: env.channel,
            NODE_ENV: process.env.NODE_ENV,
        })

        let _ = await io.getCache(url)
        if (!_ || isOutdated(_.time)) {
            await io.refetch(url)
            _ = await io.getCache(url)
        }
        if (!_) return
        const parsedCache = tryParse(_.response)
        // we don't retry if the response is invalid
        if (!parsedCache || typeof parsedCache !== 'object') return
        for (const key in parsedCache) {
            if (key in original && typeof original[key] === typeof parsedCache[key]) {
                flags[key] = parsedCache[key]
            }
        }
    }
    return [flagProxy, fetch] as const
}

function isOutdated(cacheTime: number) {
    return Date.now() - cacheTime > 60 * 60 * 2000 // 2hr
}
function tryParse(x: string) {
    try {
        return JSON.parse(x)
    } catch {
        return null
    }
}
