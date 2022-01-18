import { NetworkType } from '@masknet/web3-shared-evm'

export const OPENOCEAN_BASE_URL = 'https://ethapi.openocean.finance/v2/'

export const networkNames: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'eth',
    [NetworkType.Binance]: 'bsc',
    [NetworkType.Polygon]: 'polygon',
    [NetworkType.Arbitrum]: 'arbitrum',
    [NetworkType.xDai]: 'xdai',
    [NetworkType.Celo]: 'celo',
    [NetworkType.Fantom]: 'fantom',
    [NetworkType.Fuse]: 'fuse',
    [NetworkType.Aurora]: 'aurora',
    [NetworkType.Boba]: '',
    [NetworkType.Fuse]: '',
    [NetworkType.Metis]: '',
    [NetworkType.Avalanche]: '',
    [NetworkType.Optimistic]: '',
}
