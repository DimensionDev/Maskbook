export const r2d2URL = 'r2d2.to'

export enum R2d2Workers {
    opensea = 'opensea-proxy',
    gitcoin = 'gitcoin-agent',
    coinMarketCap = 'coinmarketcap-agent',
    goPlusLabs = 'gopluslabs',
}

type R2d2WorkerMatchTuple = [string, R2d2Workers]

const matchers: R2d2WorkerMatchTuple[] = [
    ['https://api.opensea.io', R2d2Workers.opensea],
    ['https://gitcoin.co', R2d2Workers.gitcoin],
    ['https://web-api.coinmarketcap.com', R2d2Workers.coinMarketCap],
    ['https://api.gopluslabs.io', R2d2Workers.goPlusLabs],
]

/**
 * Why use r2d2 fetch: some third api provider will be block in Firefox and protect api key
 * @returns fetch response
 * @param input
 * @param init
 */
export async function r2d2Fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const url = init instanceof Request ? init.url : (input as string)
    if (url.includes('r2d2.to')) return globalThis.fetch(input, init)

    const r2deWorkerType = matchers.find((x) => url.startsWith(x[0]))?.[1]

    if (!r2deWorkerType) {
        return globalThis.fetch(input, init)
    }

    const origin = new URL(url).origin
    const r2d2ProxyURL = url.replace(origin, `https://${r2deWorkerType}.${r2d2URL}`)

    return globalThis.fetch(r2d2ProxyURL, init)
}
