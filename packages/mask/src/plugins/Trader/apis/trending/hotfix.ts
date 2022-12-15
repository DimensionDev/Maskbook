import { getEnumAsArray } from '@masknet/kit'
import { ChainId, getCoinGeckoConstants, getCoinMarketCapConstants } from '@masknet/web3-shared-evm'
import { isSameAddress, SourceType } from '@masknet/web3-shared-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import STOCKS_KEYWORDS from './stocks.json'
import CASHTAG_KEYWORDS from './cashtag.json'
import HASHTAG_KEYWORDS from './hashtag.json'

const BLACKLIST_MAP: {
    [key in SourceType]: {
        [key in ChainId]?: string[]
    }
} = {
    [SourceType.CoinMarketCap]: {
        [ChainId.Mainnet]: [
            '8410', // NFTX Hashmasks Index
        ],
    },
    [SourceType.CoinGecko]: {
        [ChainId.Mainnet]: ['swaptoken', 'nftx-hashmasks-index'],
    },
    // use token address as id and all letters should be lower-case
    [SourceType.UniswapInfo]: {
        [ChainId.Mainnet]: [],
    },
    [SourceType.NFTScan]: {},
    [SourceType.X2Y2]: {},
    [SourceType.Chainbase]: {},
    [SourceType.Zerion]: {},
    [SourceType.Rarible]: {},
    [SourceType.OpenSea]: {},
    [SourceType.Alchemy_EVM]: {},
    [SourceType.LooksRare]: {},
    [SourceType.Zora]: {},
    [SourceType.Gem]: {},
    [SourceType.GoPlus]: {},
    [SourceType.Rabby]: {},
    [SourceType.R2D2]: {},
    [SourceType.DeBank]: {},
    [SourceType.Flow]: {},
    [SourceType.Solana]: {},
    [SourceType.RSS3]: {},
    [SourceType.Alchemy_FLOW]: {},
    [SourceType.MagicEden]: {},
    [SourceType.Element]: {},
    [SourceType.Solsea]: {},
    [SourceType.Solanart]: {},
    [SourceType.RaritySniper]: {},
    [SourceType.TraitSniper]: {},
    [SourceType.CF]: {},
}

const KEYWORD_ALIAS_MAP: {
    [key in SourceType]: {
        [key in ChainId]?: Record<string, string>
    }
} = {
    [SourceType.CoinMarketCap]: {
        [ChainId.Mainnet]: {
            NYFI: 'n0031',
        },
    },
    [SourceType.CoinGecko]: {
        [ChainId.Mainnet]: {
            NYFI: 'n0031',
        },
    },
    [SourceType.UniswapInfo]: {},
    [SourceType.NFTScan]: {},
    [SourceType.X2Y2]: {},
    [SourceType.Chainbase]: {},
    [SourceType.Zerion]: {},
    [SourceType.Rarible]: {},
    [SourceType.OpenSea]: {},
    [SourceType.Alchemy_EVM]: {},
    [SourceType.LooksRare]: {},
    [SourceType.Zora]: {},
    [SourceType.Gem]: {},
    [SourceType.GoPlus]: {},
    [SourceType.Rabby]: {},
    [SourceType.R2D2]: {},
    [SourceType.DeBank]: {},
    [SourceType.Flow]: {},
    [SourceType.Solana]: {},
    [SourceType.RSS3]: {},
    [SourceType.Alchemy_FLOW]: {},
    [SourceType.MagicEden]: {},
    [SourceType.Element]: {},
    [SourceType.Solsea]: {},
    [SourceType.Solanart]: {},
    [SourceType.RaritySniper]: {},
    [SourceType.TraitSniper]: {},
    [SourceType.CF]: {},
}

const KEYWORD_ID_MAP: {
    [key in SourceType]: {
        [key in ChainId]?: Record<string, string>
    }
} = {
    [SourceType.CoinMarketCap]: {
        [ChainId.Mainnet]: {
            UNI: '7083',
            YAM: '7131', // YAM v3
        },
    },
    [SourceType.CoinGecko]: {
        [ChainId.Mainnet]: {
            UNI: 'uniswap',
        },
    },
    [SourceType.UniswapInfo]: {},
    [SourceType.NFTScan]: {},
    [SourceType.X2Y2]: {},
    [SourceType.Chainbase]: {},
    [SourceType.Zerion]: {},
    [SourceType.Rarible]: {},
    [SourceType.OpenSea]: {},
    [SourceType.Alchemy_EVM]: {},
    [SourceType.LooksRare]: {},
    [SourceType.Zora]: {},
    [SourceType.Gem]: {},
    [SourceType.GoPlus]: {},
    [SourceType.Rabby]: {},
    [SourceType.R2D2]: {},
    [SourceType.DeBank]: {},
    [SourceType.Flow]: {},
    [SourceType.Solana]: {},
    [SourceType.RSS3]: {},
    [SourceType.Alchemy_FLOW]: {},
    [SourceType.MagicEden]: {},
    [SourceType.Element]: {},
    [SourceType.Solsea]: {},
    [SourceType.Solanart]: {},
    [SourceType.RaritySniper]: {},
    [SourceType.TraitSniper]: {},
    [SourceType.CF]: {},
}

const ID_ADDRESS_MAP: {
    [key in SourceType]: {
        [key in ChainId]?: Record<string, string>
    }
} = {
    [SourceType.CoinMarketCap]: {
        [ChainId.Mainnet]: {
            '6747': '0x32a7c02e79c4ea1008dd6564b35f131428673c41',
            '8536': '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074', // MASK
        },
        [ChainId.Matic]: {
            '8536': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [SourceType.CoinGecko]: {
        [ChainId.Mainnet]: {
            'crust-network': '0x32a7c02e79c4ea1008dd6564b35f131428673c41', // CRUST
        },
        [ChainId.Matic]: {
            'mask-network': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [SourceType.UniswapInfo]: {},
    [SourceType.NFTScan]: {},
    [SourceType.X2Y2]: {},
    [SourceType.Chainbase]: {},
    [SourceType.Zerion]: {},
    [SourceType.Rarible]: {},
    [SourceType.OpenSea]: {},
    [SourceType.Alchemy_EVM]: {},
    [SourceType.LooksRare]: {},
    [SourceType.Zora]: {},
    [SourceType.Gem]: {},
    [SourceType.GoPlus]: {},
    [SourceType.Rabby]: {},
    [SourceType.R2D2]: {},
    [SourceType.DeBank]: {},
    [SourceType.Flow]: {},
    [SourceType.Solana]: {},
    [SourceType.RSS3]: {},
    [SourceType.Alchemy_FLOW]: {},
    [SourceType.MagicEden]: {},
    [SourceType.Element]: {},
    [SourceType.Solsea]: {},
    [SourceType.Solanart]: {},
    [SourceType.RaritySniper]: {},
    [SourceType.TraitSniper]: {},
    [SourceType.CF]: {},
}

const NETWORK_ID_MAP: {
    [key in SourceType]: {
        [key in ChainId]?: string
    }
} = {
    [SourceType.CoinGecko]: {},
    [SourceType.CoinMarketCap]: {},
    [SourceType.UniswapInfo]: {},
    [SourceType.NFTScan]: {},
    [SourceType.X2Y2]: {},
    [SourceType.Chainbase]: {},
    [SourceType.Zerion]: {},
    [SourceType.Rarible]: {},
    [SourceType.OpenSea]: {},
    [SourceType.Alchemy_EVM]: {},
    [SourceType.LooksRare]: {},
    [SourceType.Zora]: {},
    [SourceType.Gem]: {},
    [SourceType.GoPlus]: {},
    [SourceType.Rabby]: {},
    [SourceType.R2D2]: {},
    [SourceType.DeBank]: {},
    [SourceType.Flow]: {},
    [SourceType.Solana]: {},
    [SourceType.RSS3]: {},
    [SourceType.Alchemy_FLOW]: {},
    [SourceType.MagicEden]: {},
    [SourceType.Element]: {},
    [SourceType.Solsea]: {},
    [SourceType.Solanart]: {},
    [SourceType.RaritySniper]: {},
    [SourceType.TraitSniper]: {},
    [SourceType.CF]: {},
}

export const SCAM_ADDRESS_MAP: {
    [key in ChainId]?: string[]
} = {
    [ChainId.Mainnet]: ['0xc89f3672d1178c83470a53edf67c4f5521e8d400'],
}

getEnumAsArray(ChainId).map(({ value: chainId }) => {
    NETWORK_ID_MAP[SourceType.CoinGecko][chainId] = getCoinGeckoConstants(chainId).PLATFORM_ID ?? ''
    NETWORK_ID_MAP[SourceType.CoinMarketCap][chainId] = getCoinMarketCapConstants(chainId).CHAIN_ID ?? ''
})

export function resolveKeyword(chainId: ChainId, keyword: string, sourceType: SourceType) {
    if (sourceType === SourceType.UniswapInfo || sourceType === SourceType.NFTScan) return keyword
    return KEYWORD_ALIAS_MAP[sourceType][chainId]?.[keyword.toUpperCase()] ?? keyword
}

export function resolveCoinId(chainId: ChainId, keyword: string, sourceType: SourceType) {
    return KEYWORD_ID_MAP[sourceType][chainId]?.[keyword.toUpperCase()]
}

export function isBlockedId(chainId: ChainId, id: string, sourceType: SourceType) {
    return BLACKLIST_MAP[sourceType][chainId]?.includes(id)
}

export function isBlockedAddress(chainId: ChainId, address: string) {
    return SCAM_ADDRESS_MAP[chainId]?.find((scamAddress) => isSameAddress(scamAddress, address))
}

export function isBlockedKeyword(type: TrendingAPI.TagType, keyword: string) {
    const search = keyword.toUpperCase()
    if (STOCKS_KEYWORDS.includes(search)) return true
    if (type === TrendingAPI.TagType.HASH) return HASHTAG_KEYWORDS.includes(search)
    if (type === TrendingAPI.TagType.CASH) return CASHTAG_KEYWORDS.includes(search)
    return true
}
