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
    nft_json: string
    nft_value: string
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
