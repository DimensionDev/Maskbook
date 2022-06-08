export const r2d2URL = 'r2d2.to'

export enum R2d2Workers {
    opensea = 'opensea-proxy',
    dodoex = 'dodoex',
    tweetTxn = 'vcent-agent',
    gitcoin = 'gitcoin',
    openseaGraphQL = 'opensea-agent',
    coinMarketCap = 'coinmarketcap-agent',
    goPlusLabs = 'gopluslabs',
    infura = 'infura',
    twitter = 'twitter',
    maskInfo = 'mask-info',
    kv = 'kv',
}

type R2d2WorkerMatchTuple = [string, R2d2Workers]

// TODO: double check with backend
const matchers: R2d2WorkerMatchTuple[] = [
    ['api.opensea.io', R2d2Workers.opensea],
    ['dodoex', R2d2Workers.dodoex],
    ['gitcoin', R2d2Workers.gitcoin],
    ['coinMarketCap', R2d2Workers.coinMarketCap],
    ['gopluslabs', R2d2Workers.goPlusLabs],
]

/**
 * Why use r2d2 fetch: some third api provider will be block in Firefox and protect api key
 * @returns fetch response
 * @param url
 * @param init
 */
export async function r2d2Fetch(url: string, init?: RequestInit): Promise<Response> {
    if (url.includes('r2d2.to')) return globalThis.fetch(url, init)

    const r2deWorkerType = matchers.find((x) => url.includes(x[0]))?.[1]

    if (!r2deWorkerType) {
        return globalThis.fetch(url, init)
    }

    const origin = new URL(url).origin
    const r2d2ProxyURL = url.replace(origin, `https://${r2deWorkerType}.${r2d2URL}`)

    return globalThis.fetch(r2d2ProxyURL, init)
}
