export namespace BaseMaskX {
    export enum PlatformType {
        Ethereum = 'eth',
        Twitter = 'twitter',
    }

    export enum SourceType {
        CyberConnect = 'cyber',
        Firefly = 'firefly',
        OpenSea = 'opensea',
        Sybil = 'sybil',
        Uniswap = 'uniswap',
        Leaderboard = 'ethLeaderboard',
        RSS3 = 'rss3',
        HandWriting = 'hand_writing',
        TwitterHexagon = 'twitter_hexagon',
    }

    export interface Identity {
        // internal uuid
        id: string
        sns_handle: string
        sns_platform: PlatformType
        // an EVM EOA
        web3_addr: string
        web3_platform: PlatformType
        // data source
        source: SourceType
        ens?: string
        // timestamp in milliseconds
        create_timestamp: string
        // timestamp in milliseconds
        modify_timestamp: string
        is_verified: boolean
    }

    export interface Options {
        size?: number
        page?: number
    }

    export interface Response {
        pagination: {
            current: number
            next: number
        }
        records: Identity[]
    }
}
