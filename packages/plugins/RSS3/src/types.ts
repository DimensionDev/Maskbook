export enum PageTags {
    WalletTag = 'Wallets',
    NFTTag = 'NFTs',
    DonationTag = 'Donations',
    FootprintTag = 'Footprints',
    DAOTag = 'DAO',
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

export interface GeneralAssetWithTags extends GeneralAsset {
    tags?: string[]
}

export interface RSS3Profile {
    avatar: string[]
    bio: string
    name: string
}

export interface DefProperty {
    description: string
    prop: string
    value: string
    value_description: string
}

export interface GalaxyCredential {
    id: string
    name: string
}

export interface POAPAction {
    event: {
        id: number
        fancy_id: string
        name: string
        event_url: string
        image_url: string
        country: string
        city: string
        description: string
        year: number
        start_date: string
        end_date: string
        expiry_date: string
        supply: number
    }
    tokenId: string
    owner: string
    chain: string
    created: string
}

export enum AssetType {
    GitcoinDonation = 'Gitcoin-Donation',
    POAP = 'POAP',
}
