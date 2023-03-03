/* cspell:disable */
const { fetch: originalFetch } = globalThis

enum Duration {
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
    'https://kv.r2d2.to/api/com.maskbook': Duration.SHORT,
    'https://discovery.attrace.com': Duration.SHORT,
    // mask-x
    'https://7x16bogxfb.execute-api.us-east-1.amazonaws.com': Duration.SHORT,
    // twitter-identity
    'https://mr8asf7i4h.execute-api.us-east-1.amazonaws.com': Duration.SHORT,
    // coingecko
    'https://coingecko-agent.r2d2.to/api/v3': Duration.SHORT,
    // chainbase ENS
    'https://chainbase-proxy.r2d2.to/v1/ens': Duration.SHORT,
    // Mask Search List
    'https://dsearch.mask.r2d2.to': Duration.MEDIUM,
    // Smart Pay
    'https://9rh2q3tdqj.execute-api.ap-east-1.amazonaws.com': Duration.LONG,
    'https://uldpla73li.execute-api.ap-east-1.amazonaws.com': Duration.LONG,
    'https://api.thegraph.com/subgraphs/name/dimensiondev/paygas-x-subgraph': Duration.LONG,
}
const URLS = Object.keys(RULES) as unknown as Array<keyof typeof RULES>

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

    // hit a cached request
    const cache = await caches.open(rule)
    const hit = await cache.match(request)
    const date = hit?.headers.get('x-cache-date')

    if (hit && date) {
        const expired = new Date(date).getTime() + RULES[rule] < Date.now()
        if (!expired) return hit
    }

    // send the request & cache the response
    const response = await next(request.clone(), init)
    const { ok, status, statusText, body, headers } = response.clone()

    if (ok && status === 200 && body) {
        await cache.put(
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

export async function staleCached(info: RequestInfo | URL, init?: RequestInit): Promise<Response | void> {
    const request = new Request(info, init)
    if (request.method !== 'GET') return

    const url = request.url
    if (!url.startsWith('http')) return

    const rule = URLS.find((x) => url.includes(x))
    if (!rule) return

    const cache = await caches.open(rule)
    const hit = await cache.match(request)
    if (!hit) return

    await cache.delete(request)
    return hit
}
