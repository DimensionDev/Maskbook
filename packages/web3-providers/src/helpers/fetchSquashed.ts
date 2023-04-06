import type { Fetcher } from './fetch.js'

const { fetch: originalFetch } = globalThis

const CACHE = new Map<
    string,
    {
        timestamp: number
        response: Promise<Response>
    }
>()
const RULES = [
    // GitCoin
    'https://gitcoin.co',

    // r2d2
    'https://x2y2-proxy.r2d2.to',
    'https://gem-proxy.r2d2.to',
    'https://opensea-proxy.r2d2.to',
    'https://nftscan-proxy.r2d2.to',
    'https://simplehash-proxy.r2d2.to',
    'https://alchemy-proxy.r2d2.to',
    'https://debank-proxy.r2d2.to',
    'https://vcent-agent.r2d2.to',
    'https://tokens.r2d2.to',
    'https://scam.mask.r2d2.to',
    'https://chainbase-proxy.r2d2.to',
    'https://coingecko-agent.r2d2.to',
    'https://coinmarketcap-agent.r2d2.to',
    'https://kv.r2d2.to',

    // mask-x
    'https://7x16bogxfb.execute-api.us-east-1.amazonaws.com',

    // twitter-identity
    'https://mr8asf7i4h.execute-api.us-east-1.amazonaws.com',

    // attrace
    'attrace.com/v1/logsearch',
    'https://discovery.attrace.com',

    // twitter post images
    'https://pbs.twimg.com/media',

    // Smart Pay
    'https://9rh2q3tdqj.execute-api.ap-east-1.amazonaws.com',
    'https://uldpla73li.execute-api.ap-east-1.amazonaws.com',
]

function __fetch__(key: string, expiration: number, request: Request, init?: RequestInit, next = originalFetch) {
    const hit = CACHE.get(key)
    if (hit && hit.timestamp + expiration > Date.now()) return hit.response.then((x) => x.clone())

    const responsePromise = next(request, init)

    // setup cache for merging subsequent requests
    CACHE.set(key, {
        timestamp: Date.now(),
        response: responsePromise,
    })

    return responsePromise.then((x) => x.clone())
}

export async function fetchSquashed(
    input: RequestInfo | URL,
    init?: RequestInit,
    next = originalFetch,
): Promise<Response> {
    const request = new Request(input, init)

    // skip all side effect requests
    if (request.method !== 'GET') return next(request, init)

    // skip all non-http requests
    const url = request.url
    if (!url.startsWith('http')) return next(request, init)

    // no need to cache
    const rule = RULES.find((x) => url.includes(x))
    if (!rule) return next(request, init)

    return __fetch__(url, 600, request, init, next)
}

export function createFetchSquashed({
    next = originalFetch,
    expiration = 600,
}: {
    next?: Fetcher
    expiration?: number
} = {}) {
    return async (input: RequestInfo | URL, init?: RequestInit, _next = next) => {
        const request = new Request(input, init)

        // skip not cacheable requests
        if (request.method !== 'GET' && request.method !== 'POST') return _next(request, init)

        // skip all non-http requests
        const url = request.url
        if (!url.startsWith('http')) return _next(request, init)

        const key = `${request.method} ${request.url} ${request.method === 'POST' ? await request.text() : 'NULL'}`

        return __fetch__(key, expiration, request, init, _next)
    }
}
