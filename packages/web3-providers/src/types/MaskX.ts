export namespace MaskX_BaseAPI {
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
        // a js like timestamp
        create_timestamp: string
        // a js like timestamp
        modify_timestamp: string
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

    export interface Provider {
        /** Get identities by precisely matching the identity id. */
        getIdentitiesExact(handle: string, platform: PlatformType, options?: Options): Promise<Response>
        /** Get identities by fuzzy searching the identity id. */
        getIdentitiesFuzzy(handle: string, platform: PlatformType, options?: Options): Promise<Response>
        /** Get all included identities. */
        getAllIdentities(options?: Options): Promise<Response>
    }
}
