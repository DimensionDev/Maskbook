import { ChainId } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../entry-helpers.js'

const NETWORK_NAME_MAP: {
    [key in string]: ChainId
} = {
    Ethereum: ChainId.Mainnet,
    'BNB Smart Chain (BEP20)': ChainId.BSC,
    Polygon: ChainId.Matic,
    'Avalanche C-Chain': ChainId.Avalanche,
    Moonbeam: ChainId.Moonbeam,
    Optimism: ChainId.Optimism,
}

export function resolveCoinMarketCapChainId(name: string) {
    return NETWORK_NAME_MAP[name]
}

export function fetchFromCoinMarketCap<T>(request: RequestInfo | URL, init?: RequestInit) {
    return fetchJSON<T>(request, init, {
        enableSquash: true,
    })
}
