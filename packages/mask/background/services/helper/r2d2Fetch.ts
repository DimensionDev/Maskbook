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

const { fetch: originalFetch } = globalThis

async function squashedFetch(request: RequestInfo, init?: RequestInit): Promise<Response> {
    console.log('DEBUG: squashedFetch')
    console.log(request)

    const cache = await caches.open('r2d2')
    const hit = await cache.match(request)
    if (hit) {
        console.log('DEBUG: hit')
    }

    const response = await originalFetch(request, init)
    if (response.ok && response.status === 200) {
        await cache.put(request, response)

        // keep cache for 1s
        setTimeout(async () => {
            await cache.delete(request)
        }, 1000)
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
    if (url.includes(R2D2_ROOT_URL)) return originalFetch(request, init)

    // infura ipfs
    if (url.includes(INFURA_IPFS_ROOT_URL)) return originalFetch(request, init)

    // hotfix rpc requests lost content-type header
    if (request.method === 'POST' && HOTFIX_RPC_URLS.some((x) => url.includes(x)))
        return originalFetch(request, { ...init, headers: { ...request?.headers, 'Content-Type': 'application/json' } })

    // fallback
    return originalFetch(request, init)
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
Reflect.set(globalThis, 'fetch', r2d2Fetch)
