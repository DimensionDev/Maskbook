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

const ID_NETWORK_MAP: Record<DataProvider, Record<string, NetworkType>> = {
    [DataProvider.COIN_GECKO]: {
        ethereum: NetworkType.Ethereum,
        'binance-smart-chain': NetworkType.Binance,
        'polygon-pos': NetworkType.Polygon,
        'arbitrum-one': NetworkType.Arbitrum,
        xdai: NetworkType.xDai,
        avalanche: NetworkType.Avalanche,
    },
    [DataProvider.COIN_MARKET_CAP]: {
        '1027': NetworkType.Ethereum,
        '1839': NetworkType.Binance,
        '3890': NetworkType.Polygon,
        '11841': NetworkType.Arbitrum,
        '5601': NetworkType.xDai,
        '43114': NetworkType.Avalanche,
    },
    [DataProvider.UNISWAP_INFO]: {},
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
    return ID_NETWORK_MAP[dataProvider][id]
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
