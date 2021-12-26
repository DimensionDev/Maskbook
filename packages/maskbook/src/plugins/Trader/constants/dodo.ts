import { NetworkType } from '@masknet/web3-shared-evm'

export const DODO_BASE_URL = 'https://dodo-route.dodoex.io'

export const networkNames: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'mainnet',
    [NetworkType.Binance]: 'bsc-mainnet',
    [NetworkType.Polygon]: 'matic',
    [NetworkType.Arbitrum]: 'arbitrum',
    [NetworkType.xDai]: 'xdai',
    [NetworkType.Fuse]: 'fuse',
}
