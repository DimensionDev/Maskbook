import type BigNumber from 'bignumber.js'
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
        name?: string
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
        attributes?: Array<{
            value: string
            trait_type: string
        }>
        standard?: string
        name?: string
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
        description?: string
        actions?: Action[]
        tokenAmount?: BigNumber
        tokenSymbol?: string
        location: string
    }

    export type FeedType = 'Token' | 'Donation' | 'NFT'

    export enum AssetType {
        GitcoinDonation = 'Gitcoin-Donation',
        POAP = 'POAP',
        NFT = 'NFT',
    }

    export type Tags = 'NFT' | 'Token' | 'POAP' | 'Gitcoin' | 'Mirror Entry' | 'ETH'

    export interface NameInfo {
        rnsName: string
        ensName: string | null
        address: string
    }

    export interface Metadata {
        collection_address?: string
        collection_name?: string
        contract_type?: string
        from?: string
        log_index?: string
        network?: 'polygon' | 'ethereum' | 'bnb'
        proof?: string
        to?: string
        token_id?: string
        token_standard?: string
        token_symbol?: string
        token_address?: string
    }

    export interface Attachments {
        address?: string
        mime_type?: string
        size_in_bytes?: string
        type?: string
    }

    export interface Web3Feed {
        attachments?: Attachments[]
        authors: string[]
        /* cspell:disable-next-line */
        backlinks: string
        date_created: string
        date_updated: string
        identifier: string
        links: string
        related_urls?: string[]
        // this field works different from API doc
        source: string
        tags: Tags[]
        summary?: string
        title?: string
        metadata?: Metadata
        imageURL?: string
        traits?: Array<{
            type: string
            value: string
        }>
    }

    export interface Web3FeedResponse {
        version: string
        date_updated: string
        identifier: string
        identifier_next?: string
        total: string
        list: Web3Feed[]
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
