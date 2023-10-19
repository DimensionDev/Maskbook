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
        [NetworkType.Fuse]: 'fuse',
        [NetworkType.Metis]: 'metis',
        [NetworkType.Boba]: 'boba',
        [NetworkType.Optimism]: 'op',
        [NetworkType.Celo]: 'celo',
        [NetworkType.Conflux]: 'cfx',
        [NetworkType.Astar]: 'astar',
        [NetworkType.Scroll]: 'scrl',
        [NetworkType.Moonbeam]: 'mobm',
        [NetworkType.CustomNetwork]: '',
    },
    'eth',
)
