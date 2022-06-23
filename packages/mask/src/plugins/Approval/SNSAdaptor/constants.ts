import { NetworkType } from '@masknet/web3-shared-evm'

export const queryNetworkMappings: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'eth',
    [NetworkType.Binance]: 'bsc',
    [NetworkType.Polygon]: 'matic',
    [NetworkType.Arbitrum]: 'arbitrum',
    [NetworkType.xDai]: 'xdai',
    [NetworkType.Avalanche]: 'avax',
    [NetworkType.Fantom]: 'ftm',
    [NetworkType.Aurora]: 'aurora',
    [NetworkType.Harmony]: 'hmy',
    [NetworkType.Fuse]: '',
    [NetworkType.Metis]: '',
    [NetworkType.Boba]: '',
    [NetworkType.Optimistic]: '',
    [NetworkType.Celo]: '',
    [NetworkType.Conflux]: '',
}
