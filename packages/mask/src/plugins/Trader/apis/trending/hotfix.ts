import { NetworkType } from '@masknet/web3-shared-evm'
import { TagType } from '../../types'
import { DataProvider } from '@masknet/public-api'
import MIRRORED_TOKENS from './mirrored_tokens.json'
import STOCKS_KEYWORDS from './stocks.json'
import CASHTAG_KEYWORDS from './cashtag.json'
import HASHTAG_KEYWORDS from './hashtag.json'
import { currentNetworkSettings } from '../../../Wallet/settings'

const BLACKLIST_MAP: {
    [key in DataProvider]: {
        [key in NetworkType]?: string[]
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        [NetworkType.Ethereum]: [
            '8410', // NFTX Hashmasks Index
        ],
    },
    [DataProvider.COIN_GECKO]: {
        [NetworkType.Ethereum]: ['swaptoken', 'nftx-hashmasks-index'],
    },
    // use token address as id and all letters should be lowercased
    [DataProvider.UNISWAP_INFO]: {
        [NetworkType.Ethereum]: [],
    },
}

const KEYWORD_ALIAS_MAP: {
    [key in DataProvider]: {
        [key in NetworkType]?: Record<string, string>
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        [NetworkType.Ethereum]: {
            NYFI: 'n0031',
        },
    },
    [DataProvider.COIN_GECKO]: {
        [NetworkType.Ethereum]: {
            NYFI: 'n0031',
        },
    },
    [DataProvider.UNISWAP_INFO]: {},
}

const KEYWORD_ID_MAP: {
    [key in DataProvider]: {
        [key in NetworkType]?: Record<string, string>
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        [NetworkType.Ethereum]: {
            UNI: '7083',
            YAM: '7131', // YAM v3
        },
    },
    [DataProvider.COIN_GECKO]: {
        [NetworkType.Ethereum]: {
            UNI: 'uniswap',
        },
    },
    [DataProvider.UNISWAP_INFO]: {},
}

const ID_ADDRESS_MAP: {
    [key in DataProvider]: {
        [key in NetworkType]?: Record<string, string>
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        [NetworkType.Ethereum]: {
            '6747': '0x32a7c02e79c4ea1008dd6564b35f131428673c41', // CRUST
            '8536': '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074', // MASK
        },
        [NetworkType.Polygon]: {
            '8536': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [DataProvider.COIN_GECKO]: {
        [NetworkType.Ethereum]: {
            'crust-network': '0x32a7c02e79c4ea1008dd6564b35f131428673c41', // CRUST
        },
        [NetworkType.Polygon]: {
            'mask-network': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [DataProvider.UNISWAP_INFO]: {},
}

const NETWORK_ID_MAP: Record<DataProvider, Record<NetworkType, string>> = {
    // https://www.coingecko.com/en/coins/{value}
    [DataProvider.COIN_GECKO]: {
        [NetworkType.Ethereum]: 'ethereum',
        [NetworkType.Binance]: 'binance-smart-chain',
        [NetworkType.Polygon]: 'polygon-pos',
        [NetworkType.Arbitrum]: 'arbitrum-one',
        [NetworkType.xDai]: 'xdai',
        [NetworkType.Fantom]: 'fantom',
    },
    // https://s2.coinmarketcap.com/static/img/coins/64x64/{value}.png
    [DataProvider.COIN_MARKET_CAP]: {
        [NetworkType.Ethereum]: '1027',
        [NetworkType.Binance]: '1839',
        [NetworkType.Polygon]: '3890',
        [NetworkType.Arbitrum]: '11841',
        [NetworkType.xDai]: '5601',
        [NetworkType.Fantom]: '3513',
    },
    [DataProvider.UNISWAP_INFO]: {
        [NetworkType.Ethereum]: '',
        [NetworkType.Binance]: '',
        [NetworkType.Polygon]: '',
        [NetworkType.Arbitrum]: '',
        [NetworkType.xDai]: '',
        [NetworkType.Fantom]: '',
    },
}

export function resolveAlias(keyword: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.UNISWAP_INFO) return keyword
    return KEYWORD_ALIAS_MAP[dataProvider][currentNetworkSettings.value]?.[keyword.toUpperCase()] ?? keyword
}

export function resolveCoinId(keyword: string, dataProvider: DataProvider) {
    return KEYWORD_ID_MAP[dataProvider][currentNetworkSettings.value]?.[keyword.toUpperCase()]
}

export function resolveCoinAddress(id: string, dataProvider: DataProvider) {
    return ID_ADDRESS_MAP[dataProvider][currentNetworkSettings.value]?.[id]
}

export function resolveNetworkType(id: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.UNISWAP_INFO) return NetworkType.Ethereum
    const networks = NETWORK_ID_MAP[dataProvider]
    return Object.entries(networks).find(([_, key]) => key === id)?.[0]
}

export function isBlockedId(id: string, dataProvider: DataProvider) {
    return BLACKLIST_MAP[dataProvider][currentNetworkSettings.value]?.includes(id)
}

export function isBlockedKeyword(type: TagType, keyword: string) {
    const search = keyword.toUpperCase()
    if (STOCKS_KEYWORDS.includes(search)) return true
    if (type === TagType.HASH) return HASHTAG_KEYWORDS.includes(search)
    if (type === TagType.CASH) return CASHTAG_KEYWORDS.includes(search)
    return true
}

export function isMirroredKeyword(symbol: string) {
    return MIRRORED_TOKENS.map((x) => x.symbol).some((x) => x.toUpperCase() === symbol.toUpperCase())
}
