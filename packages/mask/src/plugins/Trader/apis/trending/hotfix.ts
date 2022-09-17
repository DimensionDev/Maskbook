import { getEnumAsArray } from '@dimensiondev/kit'
import { ChainId, getCoinGeckoConstants, getCoinMarketCapConstants } from '@masknet/web3-shared-evm'
import { isSameAddress } from '@masknet/web3-shared-base'
import { TagType } from '../../types/index.js'
import { DataProvider } from '@masknet/public-api'
import MIRRORED_TOKENS from './mirrored_tokens.json'
import STOCKS_KEYWORDS from './stocks.json'
import CASHTAG_KEYWORDS from './cashtag.json'
import HASHTAG_KEYWORDS from './hashtag.json'

const BLACKLIST_MAP: {
    [key in DataProvider]: {
        [key in ChainId]?: string[]
    }
} = {
    [DataProvider.CoinMarketCap]: {
        [ChainId.Mainnet]: [
            '8410', // NFTX Hashmasks Index
        ],
    },
    [DataProvider.CoinGecko]: {
        [ChainId.Mainnet]: ['swaptoken', 'nftx-hashmasks-index'],
    },
    // use token address as id and all letters should be lower-case
    [DataProvider.UniswapInfo]: {
        [ChainId.Mainnet]: [],
    },
    [DataProvider.NFTScan]: {},
}

const KEYWORD_ALIAS_MAP: {
    [key in DataProvider]: {
        [key in ChainId]?: Record<string, string>
    }
} = {
    [DataProvider.CoinMarketCap]: {
        [ChainId.Mainnet]: {
            NYFI: 'n0031',
        },
    },
    [DataProvider.CoinGecko]: {
        [ChainId.Mainnet]: {
            NYFI: 'n0031',
        },
    },
    [DataProvider.UniswapInfo]: {},
    [DataProvider.NFTScan]: {},
}

const KEYWORD_ID_MAP: {
    [key in DataProvider]: {
        [key in ChainId]?: Record<string, string>
    }
} = {
    [DataProvider.CoinMarketCap]: {
        [ChainId.Mainnet]: {
            UNI: '7083',
            YAM: '7131', // YAM v3
        },
    },
    [DataProvider.CoinGecko]: {
        [ChainId.Mainnet]: {
            UNI: 'uniswap',
        },
    },
    [DataProvider.UniswapInfo]: {},
    [DataProvider.NFTScan]: {},
}

const ID_ADDRESS_MAP: {
    [key in DataProvider]: {
        [key in ChainId]?: Record<string, string>
    }
} = {
    [DataProvider.CoinMarketCap]: {
        [ChainId.Mainnet]: {
            '6747': '0x32a7c02e79c4ea1008dd6564b35f131428673c41',
            '8536': '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074', // MASK
        },
        [ChainId.Matic]: {
            '8536': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [DataProvider.CoinGecko]: {
        [ChainId.Mainnet]: {
            'crust-network': '0x32a7c02e79c4ea1008dd6564b35f131428673c41', // CRUST
        },
        [ChainId.Matic]: {
            'mask-network': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [DataProvider.UniswapInfo]: {},
    [DataProvider.NFTScan]: {},
}

const NETWORK_ID_MAP: {
    [key in DataProvider]: {
        [key in ChainId]?: string
    }
} = {
    [DataProvider.CoinGecko]: {},
    [DataProvider.CoinMarketCap]: {},
    [DataProvider.UniswapInfo]: {},
    [DataProvider.NFTScan]: {},
}

export const SCAM_ADDRESS_MAP: {
    [key in ChainId]?: string[]
} = {
    [ChainId.Mainnet]: ['0xc89f3672d1178c83470a53edf67c4f5521e8d400'],
}

getEnumAsArray(ChainId).map(({ value: chainId }) => {
    NETWORK_ID_MAP[DataProvider.CoinGecko][chainId] = getCoinGeckoConstants(chainId).PLATFORM_ID ?? ''
    NETWORK_ID_MAP[DataProvider.CoinMarketCap][chainId] = getCoinMarketCapConstants(chainId).CHAIN_ID ?? ''
})

export function resolveAlias(chainId: ChainId, keyword: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.UniswapInfo || dataProvider === DataProvider.NFTScan) return keyword
    return KEYWORD_ALIAS_MAP[dataProvider][chainId]?.[keyword.toUpperCase()] ?? keyword
}

export function resolveCoinId(chainId: ChainId, keyword: string, dataProvider: DataProvider) {
    return KEYWORD_ID_MAP[dataProvider][chainId]?.[keyword.toUpperCase()]
}

export function resolveCoinAddress(chainId: ChainId, id: string, dataProvider: DataProvider) {
    return ID_ADDRESS_MAP[dataProvider][chainId]?.[id]
}

export function resolveChainId(id: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.UniswapInfo) return ChainId.Mainnet
    const chainIds = NETWORK_ID_MAP[dataProvider]
    return Object.entries(chainIds).find(([_, key]) => key === id)?.[0]
}

export function isBlockedId(chainId: ChainId, id: string, dataProvider: DataProvider) {
    return BLACKLIST_MAP[dataProvider][chainId]?.includes(id)
}

export function isBlockedAddress(chainId: ChainId, address: string) {
    return SCAM_ADDRESS_MAP[chainId]?.find((scamAddress) => isSameAddress(scamAddress, address))
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
