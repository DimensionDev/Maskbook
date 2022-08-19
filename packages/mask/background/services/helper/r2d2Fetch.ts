import urlcat from 'urlcat'

const R2D2_ROOT_URL = 'r2d2.to'

enum R2d2Workers {
    alchemy = 'alchemy-proxy',
    opensea = 'opensea-proxy',
    gitcoin = 'gitcoin-agent',
    coinMarketCap = 'coinmarketcap-agent',
    goPlusLabs = 'gopluslabs',
    coingecko = 'coingecko-agent',
}

enum AlchemyProxies {
    eth = 'eth-mainnet',
    eth_io = 'eth-mainnet-io',
    polygon = 'polygon-mainnet',
    flow = 'flow-mainnet',
}

const AlchemyMatchers: Array<[string, AlchemyProxies]> = [
    ['https://eth-mainnet.alchemyapi.io', AlchemyProxies.eth_io],
    ['https://eth-mainnet.g.alchemy.com', AlchemyProxies.eth],
    ['https://polygon-mainnet.g.alchemy.com', AlchemyProxies.polygon],
    ['https://flow-mainnet.g.alchemy.com', AlchemyProxies.flow],
]

const WorkerMatchers: Array<[string, R2d2Workers]> = [
    ['https://api.opensea.io', R2d2Workers.opensea],
    ['https://gitcoin.co', R2d2Workers.gitcoin],
    ['https://web-api.coinmarketcap.com', R2d2Workers.coinMarketCap],
    ['https://api.gopluslabs.io', R2d2Workers.goPlusLabs],
    ['https://api.coingecko.com', R2d2Workers.coingecko],
]

const { fetch: originalFetch } = globalThis

/**
 * Why use r2d2 fetch: some third api provider will be block in Firefox and protect api key
 * @returns fetch response
 * @param input
 * @param init
 */
export async function r2d2Fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const info = new Request(input, init)
    const url = info.url
    const u = new URL(url, location.href)

    // ipfs
    if (url.startsWith('ipfs://'))
        return originalFetch(
            urlcat('https://cors.r2d2.to?https://pz-tpsfpq.meson.network/ipfs/:ipfs', {
                ipfs: url.replace('ipfs://', ''),
            }),
            info,
        )

    // r2d2
    if (url.includes('r2d2.to')) return originalFetch(info, init)

    // r2d2 worker
    const r2deWorkerType =
        WorkerMatchers.find((x) => url.startsWith(x[0]))?.[1] ??
        (AlchemyMatchers.find((x) => url.startsWith(x[0])) ? R2d2Workers.alchemy : undefined)

    if (r2deWorkerType) {
        if (r2deWorkerType === R2d2Workers.alchemy) {
            const alchemyType = AlchemyMatchers.find((x) => u.origin === x[0])?.[1]

            return originalFetch(
                `https://${r2deWorkerType}.${R2D2_ROOT_URL}/${alchemyType}${
                    alchemyType === AlchemyProxies.eth ? '/nft' : ''
                }/v2/APIKEY/${u.pathname.replace('/nft', '').replace('/v2/', '')}${u.search}`,
                info,
            )
        }
        return originalFetch(url.replace(u.origin, `https://${r2deWorkerType}.${R2D2_ROOT_URL}`), info)
    }

    // hack astar rpc fetch
    if (url.includes('astar.api.onfinality.io')) {
        return originalFetch(info, { ...init, headers: { ...init?.headers, 'Content-type': 'application/JSON' } })
    }

    // fallback
    return originalFetch(info, init)
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
Reflect.set(globalThis, 'fetch', r2d2Fetch)
