import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { NETWORK } from './types.js'

export const RSS3_LEGACY_ENDPOINT = 'https://hub.pass3.me'
export const RSS3_FEED_ENDPOINT = 'https://pregod.rss3.dev/v1/notes/'

export const RSS3_ENDPOINT = 'https://pregod.rss3.dev/v1'

export const NETWORK_PLUGIN = {
    [NetworkPluginID.PLUGIN_EVM]: 'ethereum',
    [NetworkPluginID.PLUGIN_FLOW]: 'flow',
    [NetworkPluginID.PLUGIN_SOLANA]: 'solana',
}

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
