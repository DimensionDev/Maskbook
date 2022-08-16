import { DataProvider } from '@masknet/public-api'
import MIRRORED_TOKENS from './mirrored_tokens.json'
import { ChainId } from '@masknet/web3-shared-evm'
import type { TrendingAPI } from '../types'

const ID_ADDRESS_MAP: {
    [key in DataProvider]: {
        [key in ChainId]?: Record<string, string>
    }
} = {
    [DataProvider.COIN_MARKET_CAP]: {
        [ChainId.Mainnet]: {
            '6747': '0x32a7c02e79c4ea1008dd6564b35f131428673c41', // CRUST
            '8536': '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074', // MASK
        },
        [ChainId.Matic]: {
            '8536': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [DataProvider.COIN_GECKO]: {
        [ChainId.Mainnet]: {
            'crust-network': '0x32a7c02e79c4ea1008dd6564b35f131428673c41', // CRUST
        },
        [ChainId.Matic]: {
            'mask-network': '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7', // MASK
        },
    },
    [DataProvider.UNISWAP_INFO]: {},
    [DataProvider.NFTSCAN]: {},
}

const NETWORK_ID_MAP: {
    [key in DataProvider]: {
        [key in ChainId]?: string
    }
} = {
    [DataProvider.COIN_GECKO]: {},
    [DataProvider.COIN_MARKET_CAP]: {},
    [DataProvider.UNISWAP_INFO]: {},
    [DataProvider.NFTSCAN]: {},
}

const NETWORK_NAME_MAP: { [key in string]: ChainId } = {
    Ethereum: ChainId.Mainnet,
    'BNB Smart Chain (BEP20)': ChainId.BSCT,
    Polygon: ChainId.Matic,
    'Avalanche C-Chain': ChainId.Avalanche,
}

export function resolveCoinAddress(chainId: ChainId, id: string, dataProvider: DataProvider) {
    return ID_ADDRESS_MAP[dataProvider][chainId]?.[id]
}

export function isMirroredKeyword(symbol: string) {
    return MIRRORED_TOKENS.map((x) => x.symbol).some((x) => x.toUpperCase() === symbol.toUpperCase())
}

export function resolveChainId(id: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.UNISWAP_INFO) return ChainId.Mainnet
    const chainIds = NETWORK_ID_MAP[dataProvider]
    return Object.entries(chainIds).find(([_, key]) => key === id)?.[0]
}

export function resolveChainIdByName(name: string, symbol: string) {
    return NETWORK_NAME_MAP[name]
}

export function getCommunityLink(links: string[]): TrendingAPI.CommunityUrls {
    return links.map((x) => {
        if (x.includes('twitter')) return { type: 'twitter', link: x }
        if (x.includes('t.me')) return { type: 'telegram', link: x }
        if (x.includes('facebook')) return { type: 'facebook', link: x }
        if (x.includes('discord')) return { type: 'discord', link: x }
        if (x.includes('reddit')) return { type: 'reddit', link: x }
        return { type: 'other', link: x }
    })
}
