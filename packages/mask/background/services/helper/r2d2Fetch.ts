import { attemptUntil, fetchImageViaDOM } from '@masknet/web3-shared-base'

/* cspell:disable */
const R2D2_ROOT_URL = 'r2d2.to'

const INFURA_IPFS_ROOT_URL = 'ipfs.infura.io'

const HOTFIX_RPC_URLS = [
    'infura.io',
    'quiknode.pro',
    'binance.org',
    'aurora.dev',
    'onfinality.io',
    'arbitrum.io',
    'celo.org',
    'ftm.tools',
    'gnosischain.com',
    'avax.network',
    'optimism.io',
    'harmony.one',
    'hmny.io',
    'hermesdefi.io',
    'pokt.network',
    'confluxrpc.com',
]

const { fetch: originalFetch } = globalThis

async function squashedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return new Response()
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
