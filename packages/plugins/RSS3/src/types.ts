import type { RSS3BaseAPI } from '@masknet/web3-providers'

export enum PageTags {
    WalletTag = 'Wallets',
    NFTTag = 'NFTs',
    DonationTag = 'Donations',
    FootprintTag = 'Footprints',
}

export interface Asset {
    chain: string
}

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

export interface RSS3Profile {
    avatar: string[]
    bio: string
    name: string
}

export enum AssetType {
    GitcoinDonation = 'Gitcoin-Donation',
    POAP = 'POAP',
}
/**
 * Normalized RSS3BaseAPI.Activity
 */
export interface RSS3Feed {
    image: string
    title?: string
    relatedURLs?: string[]
    description?: string
    network: RSS3BaseAPI.Network
    metadata?: RSS3BaseAPI.Metadata
    attributes?: RSS3BaseAPI.Attribute[]
    tokenId?: string
}
