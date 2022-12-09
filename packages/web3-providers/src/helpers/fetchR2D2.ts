/* cspell:disable */
import { attemptUntil, fetchImageViaDOM } from '@masknet/web3-shared-base'
import { fetchBlob } from './fetchBlob.js'

const { fetch: originalFetch } = globalThis

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

export async function fetchR2D2(input: RequestInfo | URL, init?: RequestInit, next = originalFetch): Promise<Response> {
    const request = new Request(input, init)
    const url = request.url

    // hotfix image requests
    if (request.method === 'GET' && request.headers.get('accept')?.includes('image/')) {
        return new Response(
            await attemptUntil<Blob | null>([() => fetchBlob(url, request), () => fetchImageViaDOM(url)], null),
            {
                headers: {
                    'Content-Type': 'image/png',
                },
            },
        )
    }

    // r2d2
    if (url.includes(R2D2_ROOT_URL)) return next(request, init)

    // infura ipfs
    if (url.includes(INFURA_IPFS_ROOT_URL)) return originalFetch(request, init)

    // hotfix rpc requests lost content-type header
    if (request.method === 'POST' && HOTFIX_RPC_URLS.some((x) => url.includes(x)))
        return originalFetch(request, { ...init, headers: { ...request?.headers, 'Content-Type': 'application/json' } })

    // fallback
    return next(request, init)
}
