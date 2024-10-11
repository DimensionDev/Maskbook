import { ChainId } from '@masknet/web3-shared-evm'
import type { RSS3BaseAPI } from '../types/RSS3.js'

export const RSS3_LEGACY_ENDPOINT = 'https://hub.pass3.me'
export const RSS3_ENDPOINT = 'https://kurora-v2.rss3.dev'
export const RSS3_FEED_ENDPOINT = 'https://gi.rss3.io/decentralized'

/** Lowercase platform as key */
export const PlatformToChainIdMap: Partial<Record<RSS3BaseAPI.Network, ChainId>> = {
    arbitrum: ChainId.Arbitrum,
    avax: ChainId.Avalanche,
    crossbell: ChainId.Crossbell,
    ethereum: ChainId.Mainnet,
    'binance-smart-chain': ChainId.BSC,
    polygon: ChainId.Polygon,
    gnosis: ChainId.xDai,
    optimism: ChainId.Optimism,
    base: ChainId.Base,
}

export const NameServiceToChainMap = {
    eth: ChainId.Mainnet,
    csb: ChainId.Crossbell,
    lens: ChainId.Polygon,
    bnb: ChainId.BSC,
    bit: ChainId.Mainnet,
    888: ChainId.Mainnet,
    bitcoin: ChainId.Mainnet,
    blockchain: ChainId.Mainnet,
    crypto: ChainId.Mainnet,
    dao: ChainId.Mainnet,
    nft: ChainId.Mainnet,
    wallet: ChainId.Mainnet,
    x: ChainId.Mainnet,
    zil: ChainId.Mainnet,
} as const
