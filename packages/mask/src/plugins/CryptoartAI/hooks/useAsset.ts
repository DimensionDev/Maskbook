import { useAccount, useChainId, useTokenConstants, isSameAddress } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { toTokenIdentifier } from '../utils'
import type { CryptoartAIToken } from '../types'

import { getAsset } from '../apis'

interface OwnerProps {
    ownerAddress: string
}

export function useAsset(token?: CryptoartAIToken) {
    const account = useAccount()
    const chainId = useChainId()
    const { WNATIVE_ADDRESS } = useTokenConstants()

    return useAsyncRetry(async () => {
        if (!token) return

        const assetResponse = await getAsset(token.tokenId, chainId)

        return {
            owner: assetResponse.owners,
            trade: assetResponse.trade,
            is_owner: assetResponse.owners.some((owner: OwnerProps) => isSameAddress(owner.ownerAddress, account)),
            creator: assetResponse.creatorInfo,
            token_id: assetResponse.id,
            title: assetResponse.title,
            description: assetResponse.description,
            ossUrl: assetResponse.ossUrl,
            ossUrlCompress: assetResponse.ossUrlCompress,
            shareUrl: assetResponse.shareUrl,
            priceInWei: assetResponse.priceInWei,
            priceInEth: assetResponse.priceInEth,
            lowestAuctionPriceWei: assetResponse.lowestAuctionPriceWei,
            lowestAuctionPriceEth: assetResponse.lowestAuctionPriceEth,
            isEnableAuction: assetResponse.isEnableAuction,
            totalAvailable: assetResponse.totalAvailable,
            rareType: assetResponse.rareType,
            artistCommission: assetResponse.artistCommission,
            tokenUri: assetResponse.tokenUri,
            editionType: assetResponse.editionType,
            editionNumber: assetResponse.editionNumber,
            metadataContentLength: assetResponse.metadataContentLength,
            metadataContentType: assetResponse.metadataContentType,
            metadateColorModel: assetResponse.metadateColorModel,
            metadataHasAlpha: assetResponse.metadataHasAlpha,
            metadataPixelWidth: assetResponse.metadataPixelWidth,
            metadataPixelHeight: assetResponse.metadataPixelHeight,
            viewCount: assetResponse.viewCount,
            createTime: assetResponse.createTime,
            soldNum: assetResponse.soldNum,
            totalSurplus: assetResponse.totalSurplus,
            labelList: assetResponse.labelList,
            priceInUsd: assetResponse.priceInUsd,
            likeNum: assetResponse.likeNum,
            hasLike: assetResponse.hasLike,
            linkWithCreation: assetResponse.linkWithCreation,
            linkWithIpfs: assetResponse.linkWithIpfs,
            latestBidVo: assetResponse.latestBidVo,
            bidVoList: assetResponse.bidVoList,
            auditStatus: assetResponse.auditStatus,
            auditReason: assetResponse.auditReason,
            isSoldOut: assetResponse.isSoldOut,
            is24Auction: assetResponse.is24Auction,
            isCreateSplit: assetResponse.isCreateSplit,
            splitList: assetResponse.splitList,
            auctionId: assetResponse.auctionId,
            onSales: assetResponse.onSales,
            startTimestamp24Auction: assetResponse.startTimestamp24Auction,
            is_auction: false,
        }
    }, [toTokenIdentifier(token), account, chainId, WNATIVE_ADDRESS])
}
