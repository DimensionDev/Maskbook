interface AttributeValue {
    attributes_value: string
    total: number
}
interface Attribute {
    attributes_name: string
    attributes_values: AttributeValue[]
    total: number
}
export interface Collection {
    contract_address: string
    name: string
    symbol: string
    description: string
    website: string | null
    email: string | null
    twitter: string | null
    discord: string | null
    telegram: string | null
    github: string | null
    instagram: string | null
    medium: string | null
    logo_url: string
    banner_url: string
    featured_url: string
    large_image_url: string
    attributes: Attribute[]
    erc_type: ErcType | string
    deploy_block_number: number
    owner: string
    verified: boolean
    items_total: number
    owners_total: number
    opensea_floor_price: number
    floor_price: number
    price_symbol: string
    collections_with_same_name: []
}

export interface NFTScanAsset {
    contract_address: string
    contract_name: string
    contract_token_id: string
    token_id: string
    erc_type: ErcType | string
    owner: string
    mint_transaction_hash: string
    mint_timestamp: number
    mint_price: number
    token_uri?: string
    minter: string
    metadata_json?: string
    name: string
    /** mime type */
    content_type: string
    content_uri: string
    image_uri?: string
    external_uri: string
    latest_trade_price: string | null
    latest_trade_timestamp: number | null
    nftscan_id: string | null
    nftscan_uri: string | null
}

export enum ErcType {
    ERC721 = 'erc721',
    ERC1155 = 'erc1155',
}

/**
 * User assets group by contract address
 */
export interface UserAssetsGroup {
    contract_address: string
    contract_name: string
    logo_url: string
    owns_total: number
    items_total: number
    description: string
    assets: NFTScanAsset[]
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
    discord?: string
    instagram?: string
    medium?: string
    facebook?: string
    reddit?: string
    telegram?: string
    youtube?: string
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
