import { DataProvider, TagType } from '../../types'
import { unreachable } from '../../../../utils/utils'
import MIRRORED_TOKENS from './mirrored_tokens.json'
import STOCKS_KEYWORDS from './stocks.json'
import CASHTAG_KEYWORDS from './cashtag.json'
import HASHTAG_KEYWORDS from './hashtag.json'

const BLACKLIST_MAP: {
    [key in DataProvider]: string[]
} = {
    [DataProvider.COIN_MARKET_CAP]: [
        '8410', // NFTX Hashmasks Index
    ],
    [DataProvider.COIN_GECKO]: ['swaptoken', 'nftx-hashmasks-index'],
    // use token address as id and all letters should be lowercased
    [DataProvider.UNISWAP_INFO]: [],
}

const KEYWORD_ALIAS_MAP: {
    [key in DataProvider]: {
        [key: string]: string
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        NYFI: 'n0031',
    },
    [DataProvider.COIN_GECKO]: {
        NYFI: 'n0031',
    },
    [DataProvider.UNISWAP_INFO]: {},
}

const KEYWORK_ID_MAP: {
    [key in DataProvider]: {
        [key: string]: string
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        UNI: '7083',
        YAM: '7131', // YAM v3
    },
    [DataProvider.COIN_GECKO]: {
        UNI: 'uniswap',
    },
    [DataProvider.UNISWAP_INFO]: {},
}

const ID_ADDRESS_MAP: {
    [key in DataProvider]: {
        [key: string]: string
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        '6747': '0x32a7c02e79c4ea1008dd6564b35f131428673c41', // CRUST
        '8536': '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074', // MASK
    },
    [DataProvider.COIN_GECKO]: {
        'crust-network': '0x32a7c02e79c4ea1008dd6564b35f131428673c41',
    },
    [DataProvider.UNISWAP_INFO]: {},
}

export function resolveAlias(keyword: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.COIN_MARKET_CAP)
        return KEYWORD_ALIAS_MAP[DataProvider.COIN_MARKET_CAP][keyword.toUpperCase()] ?? keyword
    if (dataProvider === DataProvider.COIN_GECKO)
        return KEYWORD_ALIAS_MAP[DataProvider.COIN_GECKO][keyword.toUpperCase()] ?? keyword
    if (dataProvider === DataProvider.UNISWAP_INFO) return keyword
    unreachable(dataProvider)
}

export function resolveCoinId(keyword: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.COIN_MARKET_CAP)
        return KEYWORK_ID_MAP[DataProvider.COIN_MARKET_CAP][keyword.toUpperCase()]
    if (dataProvider === DataProvider.COIN_GECKO) return KEYWORK_ID_MAP[DataProvider.COIN_GECKO][keyword.toUpperCase()]
    if (dataProvider === DataProvider.UNISWAP_INFO)
        return KEYWORK_ID_MAP[DataProvider.UNISWAP_INFO][keyword.toUpperCase()]
    unreachable(dataProvider)
}

export function resolveCoinAddress(id: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.COIN_MARKET_CAP) return ID_ADDRESS_MAP[DataProvider.COIN_MARKET_CAP][id]
    if (dataProvider === DataProvider.COIN_GECKO) return ID_ADDRESS_MAP[DataProvider.COIN_GECKO][id]
    if (dataProvider === DataProvider.UNISWAP_INFO) return ID_ADDRESS_MAP[DataProvider.UNISWAP_INFO][id]
    unreachable(dataProvider)
}

export function isBlockedId(id: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.COIN_MARKET_CAP) return BLACKLIST_MAP[DataProvider.COIN_MARKET_CAP].includes(id)
    if (dataProvider === DataProvider.COIN_GECKO) return BLACKLIST_MAP[DataProvider.COIN_GECKO].includes(id)
    if (dataProvider === DataProvider.UNISWAP_INFO) return BLACKLIST_MAP[DataProvider.UNISWAP_INFO].includes(id)
    unreachable(dataProvider)
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
