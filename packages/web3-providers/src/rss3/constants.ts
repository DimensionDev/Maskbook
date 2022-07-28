import { NetworkPluginID } from '@masknet/web3-shared-base'

export const RSS3_ENDPOINT = 'https://hub.pass3.me'
export const NEW_RSS3_ENDPOINT = 'https://pregod.rss3.dev/v1.1.0/notes/'

export const RSS3_FEED_ENDPOINT = 'https://pregod.rss3.dev/v0.4.0/'

export const NETWORK_PLUGINID = {
    [NetworkPluginID.PLUGIN_EVM]: 'ethereum',
    [NetworkPluginID.PLUGIN_FLOW]: 'flow',
    [NetworkPluginID.PLUGIN_SOLANA]: 'solana',
}

export const CollectionType = {
    NFT: /Polygon.NFT|Ethereum.NFT|BSC.NFT/,
    donation: /Gitcoin.Donation/,
    footprint: /Mirror.XYZ|xDai.POAP/,
}

export enum NETWORK {
    ethereum = 'ethereum',
    ethereum_classic = 'ethereum_classic',
    binance_smart_chain = 'binance_smart_chain',
    polygon = 'polygon',
    zksync = 'zksync',
    xdai = 'xdai',
    arweave = 'arweave',
    arbitrum = 'arbitrum',
    optimism = 'optimism',
    fantom = 'fantom',
    avalanche = 'avalanche',
    crossbell = 'crossbell',
}
export enum PLATFORM {
    mirror = 'mirror',
    lens = 'lens',
    gitcoin = 'gitcoin',
    snapshot = 'snapshot',
    uniswap = 'uniswap',
    binance = 'binance',
    crossbell = 'crossbell',
}

export enum TAG {
    social = 'social',
    transaction = 'transaction',
    exchange = 'exchange',
    collectible = 'collectible',
    donation = 'donation',
    governance = 'governance',
}

export enum TYPE {
    transfer = 'transfer',
    mint = 'mint',
    burn = 'burn',
    withdraw = 'withdraw',
    deposit = 'deposit',
    swap = 'swap',
    trade = 'trade',
    poap = 'poap',
    post = 'post',
    comment = 'comment',
    share = 'share',
    profile = 'profile',
    follow = 'follow',
    unfollow = 'unfollow',
    like = 'like',
    propose = 'propose',
    vote = 'vote',
    launch = 'launch',
    donate = 'donate',
}
