import { Duration } from './fetchCached.js'
import { fetchCachedJSON } from './fetchJSON.js'

export interface ChainConfig {
    name: string
    chain: string
    icon: string
    rpc: string[]
    features: Array<{ name: LiteralUnion<'EIP155' | 'EIP1559'> }>
    faucets: []
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
    infoURL: string
    shortName: string
    chainId: number
    networkId: number
    slip44: number
    ens: {
        registry: string
    }
    explorers: Array<{
        name: string
        url: string
        standard: LiteralUnion<'EIP3091'>
    }>
}

export async function fetchChains() {
    return fetchCachedJSON<ChainConfig[]>('https://chainid.network/chains.json', undefined, {
        squashExpiration: 0,
        cacheDuration: Duration.TWELVE_HOURS,
    })
}
