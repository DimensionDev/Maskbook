const { fetch: originalFetch } = globalThis

enum Duration {
    SHORT = 60000, // 1 min
    LONG = 1800000, // 30 mins
}

const RULES = {
    // twitter shorten links
    'https://t.co': Duration.LONG,
    'https://gitcoin.co/grants/v1/api/grant': Duration.SHORT,
    'https://vcent-agent.r2d2.to': Duration.SHORT,
    'https://rss3.domains/name': Duration.SHORT,
    // avatar on RSS3 kv queries
    'https://kv.r2d2.to/api/com.maskbook': Duration.SHORT,
    'https://discovery.attrace.com': Duration.SHORT,
    // mask-x
    '7x16bogxfb.execute-api.us-east-1.amazonaws.com': Duration.SHORT,
    // coingecko
    'https://coingecko-agent.r2d2.to/api/v3': Duration.SHORT,
}
const URLS = Object.keys(RULES) as unknown as Array<keyof typeof RULES>

export async function fetchCached(
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
    const rule = URLS.find((x) => url.includes(x))
    if (!rule) return next(request, init)

    // hit a cached request
    const cache = await caches.open(rule)
    const hit = await cache.match(request)
    const date = hit?.headers.get('x-cache-date')

    if (hit && date) {
        const expired = new Date(date).getTime() + RULES[rule] > Date.now()
        if (!expired) return hit
    }

    // send the request & cache the response
    const response = await next(request.clone(), init)
    const body = response.clone().body

    if (response.ok && response.status === 200 && body) {
        await cache.put(
            request.clone(),
            new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    ...Object.fromEntries(response.headers.entries()),
                    // store the cached date as a UTC string
                    'x-cache-date': new Date().toUTCString(),
                },
            }),
        )
    }
    return response
}

export async function staleCache(info: RequestInfo, init?: RequestInit) {
    const request = new Request(info, init)

    if (request.method !== 'GET') return
    if (!request.url.startsWith('http')) return

    const { host } = new URL(request.url)
    const cache = await caches.open(host)
    const hit = await cache.match(request)
    if (!hit) return

    await cache.delete(request)
    return hit
}
