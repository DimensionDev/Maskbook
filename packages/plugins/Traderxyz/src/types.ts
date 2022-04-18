/* eslint-disable no-restricted-imports */
/* eslint-disable spaced-comment */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface nftData {
    image_preview_url: string
    image_thumbnail_url?: string
    nft_name: string
    nft_id?: number
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

export interface orderInfo {
    [key: string]: any
    receiving_token: object
}
