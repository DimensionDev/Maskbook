import { useMemo, type HTMLProps } from 'react'
import { RedPacketEnvelope } from './RedPacketEnvelope.js'
import { t } from '@lingui/core/macro'
import { multipliedBy, rightShift } from '@masknet/web3-shared-base'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'

interface Props extends HTMLProps<HTMLDivElement> {
    theme?: FireflyRedPacketAPI.ThemeGroupSettings
    message: string
    token?: Web3Helper.FungibleTokenAll
    creator: string
    shares: number
    isRandom: boolean
    rawAmount: string
}
export function PreviewRedPacket({ theme, message, token, creator, shares, isRandom, rawAmount, ...props }: Props) {
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : (shares ?? '0')), [amount, shares, isRandom])
    if (!theme || !token) return null

    return (
        <RedPacketEnvelope
            {...props}
            cover={theme.cover.bg_image}
            message={message || t`Best Wishes!`}
            token={token}
            creator={creator}
            shares={shares}
            claimedCount={0}
            total={totalAmount.toFixed()}
            totalClaimed="0"
        />
    )
}
