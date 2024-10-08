import { ChainId, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { fetchSquashedJSON } from '../helpers/fetchJSON.js'
import { isSameAddress } from '@masknet/web3-shared-base'

const NETWORK_NAME_MAP: {
    [key in string]: ChainId
} = {
    Ethereum: ChainId.Mainnet,
    'BNB Smart Chain (BEP20)': ChainId.BSC,
    Polygon: ChainId.Polygon,
    'Avalanche C-Chain': ChainId.Avalanche,
    Moonbeam: ChainId.Moonbeam,
    Optimism: ChainId.Optimism,
}

const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export function resolveCoinMarketCapChainId(name: string) {
    return NETWORK_NAME_MAP[name]
}

export function resolveCoinMarketCapAddress(address: string) {
    return isSameAddress(NATIVE_TOKEN_ADDRESS, address) ? ZERO_ADDRESS : address
}

export function fetchFromCoinMarketCap<T>(request: RequestInfo | URL, init?: RequestInit) {
    return fetchSquashedJSON<T>(request, init)
}
