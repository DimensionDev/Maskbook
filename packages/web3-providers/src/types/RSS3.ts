import type RSS3 from 'rss3-next'

export namespace RSS3BaseAPI {
    export interface GeneralAsset {
        platform: string
        identity: string
        id: string // contractAddress-id or admin_address
        type: string
        info: {
            collection?: string
            collection_icon?: string
            image_preview_url?: string | null
            animation_url?: string | null
            animation_original_url?: string | null
            title?: string
            total_contribs?: number
            token_contribs?: Array<{
                token: string
                amount: string
            }>
            start_date?: string
            end_date?: string
            country?: string
            city?: string
        }
    }

    export interface GeneralAssetWithTags extends GeneralAsset {
        tags?: string[]
    }

    export interface GeneralAssetResponse {
        status: boolean
        assets: GeneralAsset[]
    }

    export interface ProfileInfo {
        avatar: string[]
        bio: string
        name: string
    }

    export interface Token {
        name: string
        image?: string
        value?: string
        symbol?: string
        decimals?: number
        standard?: string
    }
    export interface Metadata {
        id?: string
        logo?: string
        title?: string
        token?: Token
        platform?: PLATFORM
        description?: string
        image?: string
    }

    export interface Action {
        tag: TAG
        type: TYPE
        address_from?: string
        address_to?: string
        metadata?: Metadata
        platform?: PLATFORM
        related_urls?: string[]
    }

    export type NETWORK =
        | 'ethereum'
        | 'ethereum_classic'
        | 'binance_smart_chain'
        | 'polygon'
        | 'zksync'
        | 'xdai'
        | 'arweave'
        | 'arbitrum'
        | 'optimism'
        | 'fantom'
        | 'avalanche'
        | 'crossbell'

    export type PLATFORM = 'mirror' | 'lens' | 'gitcoin' | 'snapshot' | 'uniswap' | 'binance' | 'crossbell'

    export type TAG = 'social' | 'transaction' | 'exchange' | 'collectible' | 'donation' | 'governance'

    export type TYPE =
        | 'transfer'
        | 'mint'
        | 'burn'
        | 'withdraw'
        | 'deposit'
        | 'swap'
        | 'trade'
        | 'poap'
        | 'post'
        | 'comment'
        | 'share'
        | 'profile'
        | 'follow'
        | 'unfollow'
        | 'like'
        | 'propose'
        | 'vote'
        | 'launch'
        | 'donate'
    export interface CollectionResponse {
        timestamp: string
        hash: string
        owner?: string
        address_from?: string
        address_to?: string
        network?: NETWORK
        platform?: PLATFORM
        tag?: TAG
        type?: TYPE
        success?: boolean
        actions?: Action[]
    }

    export interface Collection {
        timestamp: string
        hash: string
        owner?: string
        address_from?: string
        address_to?: string
        network?: NETWORK
        platform?: PLATFORM
        id: string
        imageURL?: string
        title?: string
    }

    export enum AssetType {
        GitcoinDonation = 'Gitcoin-Donation',
        POAP = 'POAP',
        NFT = 'NFT',
    }

    export interface NameInfo {
        rnsName: string
        ensName: string | null
        address: string
    }

    export interface Provider {
        createRSS3(address: string): RSS3
        getFileData<T>(rss3: RSS3, address: string, key: string): Promise<T | undefined>
        setFileData<T>(rss3: RSS3, address: string, key: string, data: T): Promise<T>
        getDonations(address: string): Promise<Collection[] | undefined>
        getFootprints(address: string): Promise<Collection[] | undefined>
        getNameInfo(id: string): Promise<NameInfo | undefined>
        getProfileInfo(address: string): Promise<ProfileInfo | undefined>
    }
}
