import { DataProvider } from '../../types'
import { unreachable } from '../../../../utils/utils'

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

// TODO:
// we should support switching between multiple-coins in the future
const KEYWORK_ID_MAP: {
    [key in DataProvider]: {
        [key: string]: string
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        UNI: '7083',
        YAM: '7131', // v3
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
        '6747': '0x32a7c02e79c4ea1008dd6564b35f131428673c41',
        '8536': '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074',
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
