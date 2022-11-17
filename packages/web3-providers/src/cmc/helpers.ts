import { ChainId } from '@masknet/web3-shared-evm'

const NETWORK_NAME_MAP: {
    [key in string]: ChainId
} = {
    Ethereum: ChainId.Mainnet,
    'BNB Smart Chain (BEP20)': ChainId.BSCT,
    Polygon: ChainId.Matic,
    'Avalanche C-Chain': ChainId.Avalanche,
}

export function resolveCoinMarketCapChainId(name: string) {
    return NETWORK_NAME_MAP[name]
}
