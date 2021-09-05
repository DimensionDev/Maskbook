import { NetworkType } from '@masknet/web3-shared'

export const ONE_INCH_BASE_URL: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'https://api.1inch.exchange/v3.0/1/',
    [NetworkType.Binance]: 'https://api.1inch.exchange/v3.0/56/',
    [NetworkType.Polygon]: 'https://api.1inch.exchange/v3.0/137/',
    [NetworkType.Arbitrum]: '',
    [NetworkType.xDai]: '',
}
