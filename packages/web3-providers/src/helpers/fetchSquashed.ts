const { fetch: originalFetch } = globalThis

export enum Expiration {
    ONE_SECOND = 1000,
    ONE_MINUTE = 60000,
    THIRTY_MINUTES = 1800000,
    ONE_HOUR = 3600000,
}

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
    if (key) {
        CACHE.set(key, {
            timestamp: Date.now(),
            response: responsePromise,
        })
    }

    return responsePromise.then((x) => x.clone())
}

async function defaultResolver(request: Request) {
    return `${request.method} ${request.url} ${request.method === 'POST' ? await request.text() : 'NULL'}`
}

export async function fetchSquashed(
    input: RequestInfo | URL,
    init?: RequestInit,
    next = originalFetch,
    resolver = defaultResolver,
    expiration = Expiration.ONE_SECOND,
): Promise<Response> {
    // why: the caches doesn't define in test env
    if (process.env.NODE_ENV === 'test') return next(input, init)

    const request = new Request(input, init)

    // skip not cacheable requests
    if (request.method !== 'GET' && request.method !== 'POST') return next(request, init)

    // skip all non-http requests
    const url = request.url
    if (!url.startsWith('http')) return next(request, init)

    const key = await resolver(request)
    return __fetch__(key, expiration, request, init, next)
}
