import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainId } from '@masknet/web3-shared-evm'

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

export function resolveCoinMarketCapChainId(name: string): Web3Helper.ChainIdAll {
    return NETWORK_NAME_MAP[name]
}
