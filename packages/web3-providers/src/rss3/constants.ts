import { NetworkPluginID } from '@masknet/web3-shared-base'

export const RSS3_ENDPOINT = 'https://hub.pass3.me'
export const RSS3_FEED_ENDPOINT = 'https://pregod.rss3.dev/v0.4.0/'

export const PLATFORM = {
    [NetworkPluginID.PLUGIN_EVM]: 'ethereum',
    [NetworkPluginID.PLUGIN_FLOW]: 'flow',
    [NetworkPluginID.PLUGIN_SOLANA]: 'solana',
}
export const NEW_RSS3_ENDPOINT = 'https://prenode.rss3.dev'

export const CollectionType = {
    NFT: /Polygon.NFT|Ethereum.NFT|BSC.NFT/,
    donation: /Gitcoin.Donation/,
    footprint: /Mirror.XYZ|xDai.POAP/,
}
