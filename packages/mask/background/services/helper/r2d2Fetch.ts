import urlcat from 'urlcat'

const R2D2_ROOT_URL = 'r2d2.to'

enum R2d2Workers {
    Alchemy_ETH = 'eth-mainnet',
    Alchemy_ETH_IO = 'eth-mainnet-io',
    Alchemy_Polygon = 'polygon-mainnet',
    Alchemy_Flow = 'flow-mainnet',
    CORS = 'cors',
    CoinGecko = 'coingecko-agent',
    CoinMarketCap = 'coinmarketcap-agent',
    OpenSea = 'opensea-proxy',
    NFTScan = 'nftscan-proxy',
    GitCoin = 'gitcoin-agent',
    GoPlusLabs = 'gopluslabs',
    Twitter = 'twitter',
}

const WorkerMatchers: Array<[string, R2d2Workers]> = [
    ['https://eth-mainnet.alchemyapi.io', R2d2Workers.Alchemy_ETH_IO],
    ['https://eth-mainnet.g.alchemy.com', R2d2Workers.Alchemy_ETH],
    ['https://polygon-mainnet.g.alchemy.com', R2d2Workers.Alchemy_Polygon],
    ['https://flow-mainnet.g.alchemy.com', R2d2Workers.Alchemy_Flow],
    ['https://api-mainnet.magiceden.io', R2d2Workers.CORS],
    ['https://www.nftscan.com', R2d2Workers.CORS],
    ['https://api.coingecko.com', R2d2Workers.CoinGecko],
    ['https://web-api.coinmarketcap.com', R2d2Workers.CoinMarketCap],
    ['https://api.opensea.io', R2d2Workers.OpenSea],
    ['https://restapi.nftscan.com', R2d2Workers.NFTScan],
    ['https://gitcoin.co', R2d2Workers.GitCoin],
    ['https://api.gopluslabs.io', R2d2Workers.GoPlusLabs],
    ['https://twitter.com', R2d2Workers.Twitter],
]

const { fetch: originalFetch } = globalThis

function proxiedFetch(url: string, info: Request) {
    const req = new Request(url, info)
    return originalFetch(req)
}

async function contentFetch(url: string, config?: RequestInit) {
    const fetch =
        process.env.engine === 'firefox' && process.env.manifest === '2' && typeof content === 'object'
            ? content.fetch
            : globalThis.fetch
    return fetch(url, config)
}

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
        return proxiedFetch(
            urlcat('https://cors.r2d2.to?https://pz-tpsfpq.meson.network/ipfs/:ipfs', {
                ipfs: url.replace('ipfs://', ''),
            }),
            info,
        )

    // r2d2
    if (url.includes('r2d2.to')) return originalFetch(info)

    // r2d2 worker
    const r2d2WorkerType = WorkerMatchers.find((x) => url.startsWith(x[0]))?.[1]
    if (!r2d2WorkerType) return originalFetch(input, init)

    switch (r2d2WorkerType) {
        case R2d2Workers.Alchemy_ETH:
        case R2d2Workers.Alchemy_ETH_IO:
        case R2d2Workers.Alchemy_Polygon:
        case R2d2Workers.Alchemy_Flow:
            return originalFetch(
                `https://alchemy-proxy.${R2D2_ROOT_URL}/${r2d2WorkerType}${
                    r2d2WorkerType === R2d2Workers.Alchemy_ETH ? '/nft' : ''
                }/v2/APIKEY/${u.pathname.replace('/nft', '').replace('/v2/', '')}${u.search}`,
                init,
            )
        case R2d2Workers.CORS:
            return originalFetch(urlcat(`https://${r2d2WorkerType}.${R2D2_ROOT_URL}?:url`, url))
        case R2d2Workers.Twitter:
            return contentFetch(input, init)
        default:
            return originalFetch(url.replace(u.origin, `https://${r2d2WorkerType}.${R2D2_ROOT_URL}`), init)
    }
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
Reflect.set(globalThis, 'fetch', r2d2Fetch)
