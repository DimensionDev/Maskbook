import { NetworkType } from '@masknet/web3-shared-evm'

export const ZRX_BASE_URL: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: 'https://api.0x.org',
    [NetworkType.Binance]: 'https://bsc.api.0x.org/',
    [NetworkType.Polygon]: 'https://polygon.api.0x.org/',
    [NetworkType.Arbitrum]: 'https://arbitrum.api.0x.org/',
    [NetworkType.xDai]: 'https://xdai.api.0x.org/',
    [NetworkType.Optimism]: 'https://optimism.api.0x.org/',
    [NetworkType.Avalanche]: 'https://avalanche.api.0x.org/',
    [NetworkType.Celo]: 'https://celo.api.0x.org/',
    [NetworkType.Fantom]: 'https://fantom.api.0x.org/',
    [NetworkType.Aurora]: 'https://aurora.api.0x.org/',
    [NetworkType.Boba]: '',
    [NetworkType.Fuse]: '',
    [NetworkType.Metis]: '',
    [NetworkType.Harmony]: '',
    [NetworkType.Conflux]: '',
    [NetworkType.Astar]: '',
}

export const ZRX_AFFILIATE_ADDRESS = '0x934B510D4C9103E6a87AEf13b816fb080286D649'
