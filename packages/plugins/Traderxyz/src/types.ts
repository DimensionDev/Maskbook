export interface nftData {
    image_preview_url?: string
    image_thumbnail_url?: string
    nft_name?: string
    nft_id?: string
}

export interface TreeNftData {
    id: number
    token_id: string
    image_preview_url?: string
    is_selected: boolean
    collection_index: number
    item_index: number
}

export interface TradeMetaData {
    assetsInfo: {
        nfts: [
            {
                tokenAddress: string
                tokenId: string
                type: string
            },
        ]
        preview_info: {
            nftMediaUrls: nftData[]
            receivingSymbol: {
                symbol: string
                amount: number
            }
        }
        receiving_token: {
            tokenAddress: string
            type: string
            amount: number
        }
    }
    signedOrder: {
        makerAddress: string
        makerAssetAmount: string
        makerAssetData: string
        takerAddress: string
        takerAssetAmount: string
        takerAssetData: string
        expirationTimeSeconds: string
        senderAddress: string
        feeRecipientAddress: string
        salt: string
        makerFeeAssetData: string
        takerFeeAssetData: string
        makerFee: string
        takerFee: string
        signature: string
    }
}

export interface AssetContract {
    schema_name: string
    address: string
}

export interface Token {
    id: number
    token_id: string
    name?: string
    image_preview_url: string
    image_thumbnail_url?: string
    is_selected: boolean
    asset_contract: AssetContract
}

export interface PreviewNftListInterFace {
    collection_name?: string
    contract_address?: string
    tokens: Token[]
}

export type PreviewNftList = PreviewNftListInterFace

export interface OpenSeaAssetContract {
    address: string
}

export interface OpenSeaCollection {
    name: string
}

export interface OpenSeaToken {
    asset_contract: OpenSeaAssetContract
}
