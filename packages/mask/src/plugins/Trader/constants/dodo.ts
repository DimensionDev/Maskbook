import { NetworkType } from '@masknet/web3-shared-evm'

export const DODO_BASE_URL = 'https://dodoex.r2d2.to'

export const networkNames: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'mainnet',
    [NetworkType.Binance]: 'bsc-mainnet',
    [NetworkType.Polygon]: 'matic',
    [NetworkType.Arbitrum]: 'arbitrum',
    [NetworkType.xDai]: 'xdai',
    [NetworkType.Optimism]: 'Optimism',
    [NetworkType.Avalanche]: 'avalanche',
    [NetworkType.Celo]: 'celo',
    [NetworkType.Fantom]: 'fantom',
    [NetworkType.Aurora]: 'aurora',
    [NetworkType.Boba]: '',
    [NetworkType.Fuse]: '',
    [NetworkType.Metis]: '',
    [NetworkType.Optimism]: '',
    [NetworkType.Harmony]: 'harmony',
    [NetworkType.Conflux]: '',
    [NetworkType.Astar]: '',
    [NetworkType.Evmos]: '',
}
