const { fetch: originalFetch } = globalThis

const DB = new Map<
    string,
    {
        timestamp: number
        response: Promise<Response>
    }
>()
const RULES = [
    // NextID proofs API
    'https://proof-service.nextnext.id/v1/proof',
    // mask-x
    'https://7x16bogxfb.execute-api.us-east-1.amazonaws.com',
    // twitter-identity
    'https://mr8asf7i4h.execute-api.us-east-1.amazonaws.com',
]

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

    const hit = DB.get(url)
    if (hit && hit.timestamp + 600 > Date.now()) return hit.response.then((x) => x.clone())

    const responsePromise = next(request, init)

    // setup cache for merging subsequent requests
    DB.set(url, {
        timestamp: Date.now(),
        response: responsePromise,
    })

    return responsePromise.then((x) => x.clone())
}
