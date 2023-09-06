import type { Fetcher } from './fetch.js'

const { fetch: originalFetch } = globalThis

export enum Duration {
    ONE_SECOND = 1000,
    TEN_SECONDS = 10000,
    ONE_MINUTE = 60000,
    THIRTY_MINUTES = 1800000,
    TWELVE_HOURS = 43200000,
    ONE_DAY = 86400000,
}

function __open__(url: string) {
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
    const cache = await __open__(request.url)
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
    duration = Duration.ONE_MINUTE,
): Promise<Response> {
    // why: the caches doesn't define in test env
    if (process.env.NODE_ENV === 'test') return next(input, init)

    // skip all side effect requests
    const request = new Request(input, init)
    if (request.method !== 'GET') return next(request, init)

    // skip all non-http requests
    const url = request.url
    if (!url.startsWith('http')) return next(request, init)

    return __fetch__(duration, request, init, next)
}

export async function staleCached(info: RequestInfo | URL, init?: RequestInit): Promise<Response | void> {
    const request = new Request(info, init)
    if (request.method !== 'GET') return

    const url = request.url
    if (!url.startsWith('http')) return

    const cache = await __open__(url)
    const hit = await cache?.match(request)
    if (!hit) return

    await cache?.delete(request)
    return hit
}

export function createFetchCached({
    next = originalFetch,
    duration = Duration.ONE_MINUTE,
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
