import { ChainId } from '@masknet/web3-shared-evm'
import { NETWORK } from './types.js'

export const RSS3_LEGACY_ENDPOINT = 'https://hub.pass3.me'
export const RSS3_ENDPOINT = 'https://pregod.rss3.dev/v1'
export const RSS3_FEED_ENDPOINT = 'https://gi.rss3.io/decentralized/'

/** Lowercase platform as key */
export const PlatformToChainIdMap: Partial<Record<NETWORK, ChainId>> = {
    [NETWORK.arbitrum]: ChainId.Arbitrum,
    [NETWORK.avalanche]: ChainId.Avalanche,
    [NETWORK.crossbell]: ChainId.Crossbell,
    [NETWORK.ethereum]: ChainId.Mainnet,
    [NETWORK.binance_smart_chain]: ChainId.BSC,
    [NETWORK.polygon]: ChainId.Matic,
    [NETWORK.xdai]: ChainId.xDai,
    [NETWORK.optimism]: ChainId.Optimism,
    [NETWORK.fantom]: ChainId.Fantom,
}

export const NameServiceToChainMap = {
    eth: ChainId.Mainnet,
    csb: ChainId.Crossbell,
    lens: ChainId.Matic,
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
