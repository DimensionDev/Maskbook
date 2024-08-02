import urlcat from 'urlcat'
import { env } from './buildInfo.js'
import { FlagPatchSpec } from './flag-spec.js'

export interface IO {
    refetch(url: string, signal?: AbortSignal): Promise<string>
    getCache(url: string, signal?: AbortSignal): Promise<null | { response: string; time: number }>
}
export function createRemoteFlag<T extends object>(
    defaultFlags: T,
): readonly [T, (io: IO, signal?: AbortSignal, url?: string) => Promise<void>] {
    const flags = Object.assign(Object.create(null), defaultFlags)
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

        let _ = await io.getCache(url, signal)
        if (!_ || isOutdated(_.time)) {
            _ = { response: await io.refetch(url, signal), time: Date.now() }
        }
        if (!_) return
        const parsedCache = tryParse(_.response)
        // we don't retry if the response is invalid
        if (!parsedCache || typeof parsedCache !== 'object') return
        Object.assign(flags, parsedCache)
    }
    return [flagProxy, fetch] as const
}

function isOutdated(cacheTime: number) {
    return Date.now() - cacheTime > 60 * 60 * 2000 // 2hr
}
function tryParse(x: string) {
    try {
        return FlagPatchSpec.parse(JSON.parse(x)) as Record<string, any>
    } catch {
        return null
    }
}
