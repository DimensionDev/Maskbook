import urlcat from 'urlcat'
import { PROOF_BASE_URL_DEV, PROOF_BASE_URL_PROD } from '../NextID/constants.js'

const { fetch: originalFetch } = globalThis

const CACHE = new Map<
    string,
    {
        timestamp: number
        response: Promise<Response>
    }
>()
const RULES = [
    // NextID
    urlcat(PROOF_BASE_URL_PROD, '/v1/proof'),
    urlcat(PROOF_BASE_URL_DEV, '/v1/proof'),
    urlcat(PROOF_BASE_URL_DEV, '/v1/kv'),
    urlcat(PROOF_BASE_URL_DEV, '/v1/kv'),

    // GitCoin
    'https://gitcoin.co',

    // r2d2
    'https://x2y2-proxy.r2d2.to',
    'https://gem-proxy.r2d2.to',
    'https://opensea-proxy.r2d2.to',
    'https://nftscan-proxy.r2d2.to',
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

    const hit = CACHE.get(url)
    if (hit && hit.timestamp + 600 > Date.now()) return hit.response.then((x) => x.clone())

    const responsePromise = next(request, init)

    // setup cache for merging subsequent requests
    CACHE.set(url, {
        timestamp: Date.now(),
        response: responsePromise,
    })

    return responsePromise.then((x) => x.clone())
}
