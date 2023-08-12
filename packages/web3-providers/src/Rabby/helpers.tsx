import { NetworkType } from '@masknet/web3-shared-evm'
import { createLookupTableResolver } from '@masknet/shared-base'

export const resolveNetworkOnRabby = createLookupTableResolver<NetworkType, string>(
    {
        [NetworkType.Ethereum]: 'eth',
        [NetworkType.Binance]: 'bsc',
        [NetworkType.Base]: 'base',
        [NetworkType.Polygon]: 'matic',
        [NetworkType.Arbitrum]: 'arb',
        [NetworkType.xDai]: 'xdai',
        [NetworkType.Avalanche]: 'avax',
        [NetworkType.Fantom]: 'ftm',
        [NetworkType.Aurora]: 'aurora',
        [NetworkType.Fuse]: '',
        [NetworkType.Metis]: '',
        [NetworkType.Boba]: '',
        [NetworkType.Optimism]: 'op',
        [NetworkType.Celo]: '',
        [NetworkType.Conflux]: '',
        [NetworkType.Astar]: '',
        [NetworkType.Moonbeam]: '',
    },
    'eth',
)
