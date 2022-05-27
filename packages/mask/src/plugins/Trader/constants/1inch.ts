import { NetworkType } from '@masknet/web3-shared-evm'

export const ONE_INCH_BASE_URL: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'https://api.1inch.exchange/v4.0/1/',
    [NetworkType.Binance]: 'https://api.1inch.exchange/v4.0/56/',
    [NetworkType.Polygon]: 'https://api.1inch.exchange/v4.0/137/',
    [NetworkType.Arbitrum]: 'https://api.1inch.exchange/v3.0/42161/',
    [NetworkType.xDai]: 'https://api.1inch.exchange/v4.0/100/',
    [NetworkType.Celo]: 'https://api.1inch.exchange/v4.0/42220/',
    [NetworkType.Fantom]: 'https://api.1inch.exchange/v4.0/250/',
    [NetworkType.Avalanche]: 'https://api.1inch.exchange/v4.0/43114/',
    [NetworkType.Aurora]: 'https://api.1inch.exchange/v4.0/1313161554/',
    [NetworkType.Boba]: 'https://api.1inch.exchange/v4.0/288/',
    [NetworkType.Fuse]: 'https://api.1inch.exchange/v4.0/122/',
    [NetworkType.Metis]: 'https://api.1inch.exchange/v4.0/1088/',
    [NetworkType.Harmony]: 'https://api.1inch.exchange/v4.0/10/',
    [NetworkType.Conflux]: '',
    [NetworkType.Optimistic]: '',
}
