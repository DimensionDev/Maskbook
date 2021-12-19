export interface Asset {
    chain: string
}

export interface NFTResponse {
    data: NFT
}

export interface GitcoinResponse {
    data: {
        grant: GrantInfo
        txs: DonationInfo[]
    }
}

export interface NFT extends Asset {
    token_id: string
    name?: string
    chain: 'BSC' | 'Ethereum' | 'Polygon'
    description?: string | null
    image_url?: string | null
    image_preview_url?: string | null
    image_thumbnail_url?: string | null
    animation_url?: string | null
    animation_original_url?: string | null
    asset_contract: {
        address: string
        created_date?: string
        symbol?: string
    }
    collection?: {
        name: string | null
        description: string | null
        image_url: string | null
    }
    traits?: {
        trait_type: string | null
        value: string | null
    }[]
}

export interface GrantInfo {
    active: boolean
    title?: string
    slug?: string
    description?: string
    reference_url?: string
    logo?: string
    admin_address?: string
    amount_received?: string
    token_address?: string
    token_symbol?: string
    contract_address?: string
}

export interface DonationInfo {
    donor: string
    adminAddr?: string
    tokenAddr: string
    amount: string
    symbol?: string
    decimals?: number
    // cspell:ignore formated
    // formated, a typo in API schema
    formatedAmount?: string
    timeStamp: string
    txHash: string
    approach: string
}

export interface DonationDetailByGrant {
    grant: GrantInfo
    txs: DonationInfo[]
}

export interface POAP {
    event: {
        id: number
        fancy_id: string
        country: string
        city: string
        description: string
        year: number
        start_date: string
        end_date: string
        expiry_date: string
        name: string
        image_url: string
        event_url: string
        supply: number
    }
    owner: string
    tokenId: string
}

export interface POAPResponse {
    data: POAP
}

// cspell:ignore contribs
// used in api response
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
        token_contribs?: {
            token: string
            amount: string
        }[]
        start_date?: string
        end_date?: string
        country?: string
        city?: string
    }
}

export interface GeneralAssetWithTags extends GeneralAsset {
    tags?: string[]
}
