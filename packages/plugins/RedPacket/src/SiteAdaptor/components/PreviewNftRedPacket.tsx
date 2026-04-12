import { t } from '@lingui/core/macro'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { HTMLProps } from 'react'
import { NftRedPacketEnvelope, type NftRedPacketEnvelopeProps } from './NftRedPacketEnvelope.js'

interface Props extends HTMLProps<HTMLDivElement>, Pick<NftRedPacketEnvelopeProps, 'address' | 'chainId' | 'tokenId'> {
    theme?: FireflyRedPacketAPI.ThemeGroupSettings
    message: string
    creator: string
    totalShares: number
}
export function PreviewNftRedPacket({ theme, message, creator, totalShares, ...props }: Props) {
    if (!theme || !props.address) return null

    return (
        <NftRedPacketEnvelope
            {...props}
            cover={theme.cover.bg_image}
            message={message || t`Best Wishes!`}
            creator={creator}
            total={totalShares}
            shares={totalShares}
            claimedCount={0}
        />
    )
}
