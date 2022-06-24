export interface NFTScanAsset {
    last_price: string
    nft_asset_id: string
    nft_content_uri: string
    nft_cover: string
    nft_create_hash: string
    nft_create_time: string
    nft_creator: string
    nft_detail: string
    nft_holder: string
    nft_json?: string
    nft_value: string
    nft_name: string
    nft_token_uri?: string
    nft_platform_name: string
    nft_contract_address: string
    token_id: string

    trade_contract: string
    trade_symbol: string
    trade_decimal: string
}

export type NFT_Assets = {
    nft_asset: NFTScanAsset[]
    nft_asset_count: number
    nft_contract_address: string
    nft_platform_count: number
    nft_platform_describe: string
    nft_platform_image: string
    nft_platform_name: string
}

export interface NFTPlatformInfo {
    description: string
    royalty: string
    trendingVolumeAverage_24h: number
    twitter: string
    total: number
    trendingVolume_all: number
    email: string
    trendingVolume_24h: number
    floorPrice: number
    /** url */
    image: string
    highestPrice: number
    /** url */
    website: string
    /** url */
    github: string
    address: string
    /** url */
    banner: string
    authFlag: false
    /** url */
    discord: string
    instagram: string
    facebook: string
    reddit: string
    telegram: string
    trendingTotal_24h: number
    name: string
    contractCreator: string
    ownersCount: number
}

export interface SearchNFTPlatformNameResult {
    /** url */
    image: string
    address: string
    platform: string
}

export interface VolumeAndFloorRecord {
    /** timestamp */
    time: number
    floor: number
    value: number
}

export interface NFTItem {
    nft_name: string
    nft_asset_address: string
    nft_asset_number: string
    auth_flag: boolean
    nft_unique_num: string
    /** url */
    cover: string
    /** url */
    link: string
    /** mime type */
    type: string
    ercType: number
    /** url */
    logo: string
}

export interface NFTSearchData {
    nftList: NFTItem[]
    total: number
}
