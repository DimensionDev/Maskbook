import urlcat from 'urlcat'

export const r2d2URL = 'r2d2.to'

export enum R2d2Workers {
    cors = 'cors',
    alchemy = 'alchemy-proxy',
    opensea = 'opensea-proxy',
    nftscan = 'nftscan-proxy',
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

type R2d2WorkerMatchTuple = [string, R2d2Workers]

type AlchemyProxyMatchTuple = [string, AlchemyProxies]

const alchemyMatchers: AlchemyProxyMatchTuple[] = [
    ['https://eth-mainnet.alchemyapi.io', AlchemyProxies.eth_io],
    ['https://eth-mainnet.g.alchemy.com', AlchemyProxies.eth],
    ['https://polygon-mainnet.g.alchemy.com', AlchemyProxies.polygon],
    ['https://flow-mainnet.g.alchemy.com', AlchemyProxies.flow],
]

const workerMatchers: R2d2WorkerMatchTuple[] = [
    ['https://api-mainnet.magiceden.io', R2d2Workers.cors],
    ['https://www.nftscan.com', R2d2Workers.cors],
    ['https://api.opensea.io', R2d2Workers.opensea],
    ['https://restapi.nftscan.com', R2d2Workers.nftscan],
    ['https://gitcoin.co', R2d2Workers.gitcoin],
    ['https://web-api.coinmarketcap.com', R2d2Workers.coinMarketCap],
    ['https://api.gopluslabs.io', R2d2Workers.goPlusLabs],
    ['https://api.coingecko.com', R2d2Workers.coingecko],
]

/**
 * Why use r2d2 fetch: some third api provider will be block in Firefox and protect api key
 * @returns fetch response
 * @param input
 * @param init
 */
export async function r2d2Fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const url = init instanceof Request ? init.url : (input as string)

    // ipfs
    if (url.startsWith('ipfs://'))
        return globalThis.fetch(
            urlcat('https://cors.r2d2.to?https://coldcdn.com/api/cdn/mipfsygtms/ipfs/:ipfs', {
                ipfs: url.replace('ipfs://', ''),
            }),
            init,
        )

    // r2d2
    if (url.includes('r2d2.to')) return globalThis.fetch(input, init)

    // r2d2 worker
    const r2d2WorkerType =
        workerMatchers.find((x) => url.startsWith(x[0]))?.[1] ??
        (alchemyMatchers.find((x) => url.startsWith(x[0])) ? R2d2Workers.alchemy : undefined)

    const u = new URL(url)

    if (r2d2WorkerType) {
        switch (r2d2WorkerType) {
            case R2d2Workers.cors:
                return globalThis.fetch(urlcat(`https://${r2d2WorkerType}.${r2d2URL}?:url`, url))
            case R2d2Workers.alchemy:
                const alchemyType = alchemyMatchers.find((x) => u.origin === x[0])?.[1]

                return globalThis.fetch(
                    `https://${r2d2WorkerType}.${r2d2URL}/${alchemyType}${
                        alchemyType === AlchemyProxies.eth ? '/nft' : ''
                    }/v2/APIKEY/${u.pathname.replace('/nft', '').replace('/v2/', '')}${u.search}`,
                    init,
                )
            default:
                return globalThis.fetch(url.replace(u.origin, `https://${r2d2WorkerType}.${r2d2URL}`), init)
        }
    }

    // fallback
    return globalThis.fetch(input, init)
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
