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

const CACHE_RULES = {
    'https://proof-service.nextnext.id/v1/proof': 1000 * 5,
    // twitter shorten links
    'https://t.co': 1000 * 60 * 30,
    'https://gitcoin.co/grants/v1/api/grant': 1000 * 60,
    'https://vcent-agent.r2d2.to': 1000 * 60,
    'https://rss3.domains/name': 1000 * 60,
    // avatar on RSS3 kv queries
    'https://kv.r2d2.to/api/com.maskbook.user_twitter.com': 1000 * 60,
    'https://discovery.attrace.com': 1000 * 60,
    // mask-x
    '7x16bogxfb.execute-api.us-east-1.amazonaws.com': 1000 * 60,
}
const CACHE_URLS = Object.keys(CACHE_RULES) as unknown as Array<keyof typeof CACHE_RULES>

const { fetch: originalFetch } = globalThis

// #region debugging
const set = new Set()
const hitSet = new Set()

// @ts-ignore
window.dumpSet = () => {
    return set
}

// @ts-ignore
window.dumpHitSet = () => {
    return hitSet
}
// #endregion

async function squashedFetch(request: RequestInfo, init?: RequestInit): Promise<Response> {
    set.add({
        request,
        timestamp: Date.now(),
    })

    // skip all side effect requests
    if (typeof request !== 'string' && request.method !== 'GET') return originalFetch(request, init)

    // skip all non-http requests
    const url = typeof request === 'string' ? request : request.url
    if (!url.startsWith('http')) return originalFetch(request, init)

    // no need to cache
    const rule = CACHE_URLS.find((x) => url.includes(x))
    if (!rule) return originalFetch(request, init)

    // hit a cached request
    const cache = await caches.open(rule)
    const hit = await cache.match(request)
    if (hit) {
        hitSet.add({
            request,
            timestamp: Date.now(),
        })
        return hit
    }

    // send the request & cache the response
    const response = await originalFetch(request, init)

    if (response.ok && response.status === 200) {
        await cache.put(request, response)

        // stale the cache
        setTimeout(async () => {
            await cache.delete(request)
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
            [async () => (await squashedFetch(url, request)).blob(), async () => fetchImageViaDOM(url)],
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
    if (url.includes(INFURA_IPFS_ROOT_URL)) return squashedFetch(request, init)

    // hotfix rpc requests lost content-type header
    if (request.method === 'POST' && HOTFIX_RPC_URLS.some((x) => url.includes(x)))
        return squashedFetch(request, { ...init, headers: { ...request?.headers, 'Content-Type': 'application/json' } })

    // fallback
    return squashedFetch(request, init)
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
Reflect.set(globalThis, 'fetch', r2d2Fetch)
