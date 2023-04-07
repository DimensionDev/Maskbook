const { fetch: originalFetch } = globalThis

const CACHE = new Map<
    string,
    {
        timestamp: number
        response: Promise<Response>
    }
>()

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
    expiration = 600,
): Promise<Response> {
    const request = new Request(input, init)

    // skip not cacheable requests
    if (request.method !== 'GET' && request.method !== 'POST') return next(request, init)

    // skip all non-http requests
    const url = request.url
    if (!url.startsWith('http')) return next(request, init)

    const key = `${request.method} ${request.url} ${request.method === 'POST' ? await request.text() : 'NULL'}`
    return __fetch__(key, expiration, request, init, next)
}
