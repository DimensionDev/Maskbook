interface nftData {
    image_preview_url: string
    image_thumbnail_url: string
    nft_name: string
    nft_id: number
}

export interface PollMetaData {
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

export enum PollStatus {
    Inactive = 'Inactive',
    Voted = 'Voted',
    Voting = 'Voting',
    Closed = 'Closed',
}
