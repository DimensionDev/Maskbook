import { ChainId } from '@masknet/web3-shared-evm'

const NETWORK_NAME_MAP: { [key in string]: ChainId } = {
    ethereum: ChainId.Mainnet,
    'binance-smart-chain': ChainId.BSCT,
    'polygon-pos': ChainId.Matic,
}

export function resolveChain(key: string) {
    return NETWORK_NAME_MAP[key]
}
