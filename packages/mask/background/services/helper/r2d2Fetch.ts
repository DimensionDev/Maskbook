/* cspell:disable */
import { attemptUntil, fetchImageViaDOM } from '@masknet/web3-shared-base'

const R2D2_ROOT_URL = 'r2d2.to'

const INFURA_IPFS_ROOT_URL = 'ipfs.infura.io'

const HOTFIX_RPC_URLS = [
    'mainnet.infura.io',
    'ropsten.infura.io',
    'rinkeby.infura.io',
    'kovan.infura.io',
    'goerli.infura.io',
    'polygon-mainnet.infura.io',
    'polygon-mumbai.infura.io',
    'quiknode.pro',
    'binance.org',
    'polygon-rpc.com',
    'mainnet.aurora.dev',
    'testnet.aurora.dev',
    'astar.api.onfinality.io',
    'rpc.astar.network',
    'arb1.arbitrum.io',
    'rinkeby.arbitrum.io',
    'forno.celo.org',
    'rpc.ftm.tools',
    'rpc.gnosischain.com',
    'api.avax.network',
    'mainnet.optimism.io',
    'kovan.optimism.io',
    'goerli.optimism.io',
    'harmony.one',
    'hmny.io',
    'rpc.hermesdefi.io',
    'gateway.pokt.network',
    'evm.confluxrpc.com',
]

enum CACHE_DURATION {
    INSTANT = 3000, // 3 seconds
    SHORT = 60000, // 1 min
    LONG = 1800000, // 30 mins
}

const CACHE_RULES = {
    'https://proof-service.nextnext.id/v1/proof': CACHE_DURATION.INSTANT,
    // twitter shorten links
    'https://t.co': CACHE_DURATION.LONG,
    'https://gitcoin.co/grants/v1/api/grant': CACHE_DURATION.SHORT,
    'https://vcent-agent.r2d2.to': CACHE_DURATION.SHORT,
    'https://rss3.domains/name': CACHE_DURATION.SHORT,
    // avatar on RSS3 kv queries
    'https://kv.r2d2.to/api/com.maskbook.user_twitter.com': CACHE_DURATION.SHORT,
    'https://discovery.attrace.com': CACHE_DURATION.SHORT,
    // mask-x
    '7x16bogxfb.execute-api.us-east-1.amazonaws.com': CACHE_DURATION.SHORT,
    // coingecko
    'https://coingecko-agent.r2d2.to/api/v3': CACHE_DURATION.SHORT,
}
const CACHE_URLS = Object.keys(CACHE_RULES) as unknown as Array<keyof typeof CACHE_RULES>

const { fetch: originalFetch } = globalThis

async function squashedFetch(request: Request, init?: RequestInit): Promise<Response> {
    // skip all side effect requests
    if (request.method !== 'GET') return originalFetch(request, init)

    // skip all non-http requests
    const url = request.url
    if (!url.startsWith('http')) return originalFetch(request, init)

    // no need to cache
    const rule = CACHE_URLS.find((x) => url.includes(x))
    if (!rule) return originalFetch(request, init)

    // hit a cached request
    const cache = await caches.open(rule)
    const hit = await cache.match(request)
    if (hit) return hit

    // send the request & cache the response
    const response = await originalFetch(request.clone(), init)
    if (response.ok && response.status === 200) {
        await cache.put(request.clone(), response.clone())

        // stale the cache
        setTimeout(async () => {
            await cache.delete(request.clone())
        }, CACHE_RULES[rule])
    }
    return response
}

/**
 * Why use r2d2 fetch: some third api provider will be block in Firefox and protect api key
 * @returns fetch response
 * @param input
 * @param init
 */
export async function r2d2Fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const request = new Request(input, init)
    const url = request.url

    // hotfix image requests
    if (request.method === 'GET' && request.headers.get('accept')?.includes('image/')) {
        const blob = await attemptUntil<Blob | null>(
            [async () => (await originalFetch(url, request)).blob(), async () => fetchImageViaDOM(url)],
            null,
        )

        return new Response(blob, {
            headers: {
                'Content-Type': 'image/png',
            },
        })
    }

    // r2d2
    if (url.includes(R2D2_ROOT_URL)) return squashedFetch(request, init)

    // infura ipfs
    if (url.includes(INFURA_IPFS_ROOT_URL)) return originalFetch(request, init)

    // hotfix rpc requests lost content-type header
    if (request.method === 'POST' && HOTFIX_RPC_URLS.some((x) => url.includes(x)))
        return originalFetch(request, { ...init, headers: { ...request?.headers, 'Content-Type': 'application/json' } })

    // fallback
    return squashedFetch(request, init)
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
Reflect.set(globalThis, 'fetch', r2d2Fetch)
