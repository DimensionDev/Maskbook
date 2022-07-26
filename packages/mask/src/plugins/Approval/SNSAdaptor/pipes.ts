import { NetworkType } from '@masknet/web3-shared-evm'
import { createLookupTableResolver } from '@masknet/web3-shared-base'

export const resolveNetworkOnRabby = createLookupTableResolver<NetworkType, string>(
    {
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
    },
    'eth',
)
