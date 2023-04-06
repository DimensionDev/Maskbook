import type { Fetcher } from './fetch.js'

/* cspell:disable */
const { fetch: originalFetch } = globalThis

export enum Duration {
    SHORT = 60000, // 1 min
    MEDIUM = 1800000, // 30 mins
    LONG = 43200000, // 12 hours
}

const RULES = {
    // twitter shorten links
    'https://t.co': Duration.MEDIUM,
    'https://gitcoin.co/grants/v1/api/grant': Duration.SHORT,
    'https://vcent-agent.r2d2.to': Duration.SHORT,
    'https://rss3.domains/name': Duration.SHORT,

    // avatar on RSS3 kv queries
    'https://kv.r2d2.to/api/com.maskbook': Duration.LONG,
    // coingecko
    'https://coingecko-agent.r2d2.to/api/v3': Duration.SHORT,
    // chainbase
    'https://chainbase-proxy.r2d2.to/v1/ens': Duration.SHORT,
    'https://chainbase-proxy.r2d2.to/v1/space-id': Duration.SHORT,
    // Mask Search List
    'https://dsearch.mask.r2d2.to': Duration.MEDIUM,
    // Mask Token List
    'https://tokens.r2d2.to': Duration.LONG,
}
const URLS = Object.keys(RULES) as unknown as Array<keyof typeof RULES>

function openCaches(url: string) {
    if ('caches' in globalThis) {
        try {
            return caches.open(new URL(url).host)
        } catch {
            return
        }
    }
    return
}

async function __fetch__(duration: number, request: Request, init?: RequestInit, next = originalFetch) {
    // hit a cached request
    const cache = await openCaches(request.url)
    const hit = await cache?.match(request)
    const date = hit?.headers.get('x-cache-date')

    if (hit && date) {
        const expired = new Date(date).getTime() + duration < Date.now()
        if (!expired) return hit
    }

    // send the request & cache the response
    const response = await next(request.clone(), init)
    const { ok, status, statusText, body, headers } = response.clone()

    if (ok && status === 200 && body) {
        await cache?.put(
            request.clone(),
            new Response(body, {
                status,
                statusText,
                headers: {
                    ...Object.fromEntries(headers.entries()),
                    // store the cached date as a UTC string
                    'x-cache-date': new Date().toUTCString(),
                },
            }),
        )
    }
    return response
}

export async function fetchCached(
    input: RequestInfo | URL,
    init?: RequestInit,
    next = originalFetch,
): Promise<Response> {
    // why: the caches doesn't define in test env
    if (process.env.NODE_ENV === 'test') return next(input, init)

    // skip all side effect requests
    const request = new Request(input, init)
    if (request.method !== 'GET') return next(request, init)

    // skip all non-http requests
    const url = request.url
    if (!url.startsWith('http')) return next(request, init)

    // no need to cache
    const rule = URLS.find((x) => url.includes(x))
    if (!rule) return next(request, init)

    return __fetch__(RULES[rule], request, init, next)
}

export async function staleCached(info: RequestInfo | URL, init?: RequestInit): Promise<Response | void> {
    const request = new Request(info, init)
    if (request.method !== 'GET') return

    const url = request.url
    if (!url.startsWith('http')) return

    const rule = URLS.find((x) => url.includes(x))
    if (!rule) return

    const cache = await openCaches(rule)
    const hit = await cache?.match(request)
    if (!hit) return

    await cache?.delete(request)
    return hit
}

export function createFetchCached({
    next = originalFetch,
    duration = Duration.SHORT,
}: {
    next?: Fetcher
    duration?: number
} = {}) {
    return async function createFetchCached(
        input: RequestInfo | URL,
        init?: RequestInit,
        _next = next,
    ): Promise<Response> {
        // why: the caches doesn't define in test env
        if (process.env.NODE_ENV === 'test') return _next(input, init)

        // skip all side effect requests
        const request = new Request(input, init)
        if (request.method !== 'GET') return _next(request, init)

        // skip all non-http requests
        const url = request.url
        if (!url.startsWith('http')) return _next(request, init)

        return __fetch__(duration, request, init, _next)
    }
}
