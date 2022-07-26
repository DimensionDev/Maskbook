import urlcat from 'urlcat'

export const r2d2URL = 'r2d2.to'

export enum R2d2Workers {
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
    ['https://api.opensea.io', R2d2Workers.opensea],
    ['https://restapi.nftscan.com', R2d2Workers.nftscan],
    ['https://gitcoin.co', R2d2Workers.gitcoin],
    ['https://web-api.coinmarketcap.com', R2d2Workers.coinMarketCap],
    ['https://api.gopluslabs.io', R2d2Workers.goPlusLabs],
    ['https://api.coingecko.com', R2d2Workers.coingecko],
]

const { fetch: original_fetch } = globalThis
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
        return proxied_fetch(
            urlcat('https://cors.r2d2.to?https://coldcdn.com/api/cdn/mipfsygtms/ipfs/:ipfs', {
                ipfs: url.replace('ipfs://', ''),
            }),
            info,
        )

    // r2d2
    if (url.includes('r2d2.to')) return original_fetch(info)

    // r2d2 worker
    const r2deWorkerType =
        workerMatchers.find((x) => url.startsWith(x[0]))?.[1] ??
        (alchemyMatchers.find((x) => url.startsWith(x[0])) ? R2d2Workers.alchemy : undefined)

    if (r2deWorkerType) {
        if (r2deWorkerType === R2d2Workers.alchemy) {
            const alchemyType = alchemyMatchers.find((x) => u.origin === x[0])?.[1]

            return proxied_fetch(
                `https://${r2deWorkerType}.${r2d2URL}/${alchemyType}${
                    alchemyType === AlchemyProxies.eth ? '/nft' : ''
                }/v2/APIKEY/${u.pathname.replace('/nft', '').replace('/v2/', '')}${u.search}`,
                info,
            )
        }
        return proxied_fetch(url.replace(u.origin, `https://${r2deWorkerType}.${r2d2URL}`), info)
    }

    // fallback
    return original_fetch(input, init)
}

function proxied_fetch(url: string, info: Request) {
    const req = new Request(url, info)
    return original_fetch(req)
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
Reflect.set(globalThis, 'fetch', r2d2Fetch)
