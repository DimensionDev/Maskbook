import { NetworkPluginID } from '@masknet/web3-shared-base'

export const RSS3_ENDPOINT = 'https://hub.pass3.me'
export const RSS3_FEED_ENDPOINT = 'https://pregod.rss3.dev/v0.4.0./'

export const PLATFORM = {
    [NetworkPluginID.PLUGIN_EVM]: 'ethereum',
    [NetworkPluginID.PLUGIN_FLOW]: 'flow',
    [NetworkPluginID.PLUGIN_SOLANA]: 'solana',
}
