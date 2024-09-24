export enum CollectionType {
    NFTs = 'NFTs',
    Donations = 'Donations',
    Footprints = 'Footprints',
    Feeds = 'Feeds',
}

export enum TAG {
    NFT = 'NFT',
    Token = 'Token',
    POAP = 'POAP',
    Gitcoin = 'Gitcoin',
    Mirror = 'Mirror Entry',
    ETH = 'ETH',
}

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
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

type Response<T> = T | { error: string }

export type RSS3NameServiceResponse = Response<{
    ens: string
    crossbell: string
    lens: string
    spaceid: string
    unstoppable_domains: string
    bit: string
    /** hex address */
    address: string
}>
