import { type HTMLProps } from 'react'
import { t } from '@lingui/core/macro'
import { type NonFungibleAsset } from '@masknet/web3-shared-base'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NftRedPacketEnvelope } from './NftRedPacketEnvelope.js'

interface Props extends HTMLProps<HTMLDivElement> {
    theme?: FireflyRedPacketAPI.ThemeGroupSettings
    message: string
    asset?: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    collection?: Web3Helper.NonFungibleCollectionAll
    creator: string
    totalShares: number
}
export function PreviewNftRedPacket({ theme, message, asset, collection, creator, totalShares, ...props }: Props) {
    if (!theme || !asset) return null

    return (
        <NftRedPacketEnvelope
            {...props}
            cover={theme.cover.bg_image}
            message={message || t`Best Wishes!`}
            asset={asset}
            creator={creator}
            total={totalShares}
            shares={totalShares}
            claimedCount={0}
        />
    )
}
