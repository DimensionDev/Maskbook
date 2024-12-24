import { useMemo, type HTMLProps } from 'react'
import { RedPacketEnvelope } from './RedPacketEnvelope.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { t } from '@lingui/macro'
import { multipliedBy, rightShift } from '@masknet/web3-shared-base'

interface Props extends HTMLProps<HTMLDivElement> {}
export function PreviewRedPacket(props: Props) {
    const { theme, message, token, creator, shares, isRandom, rawAmount } = useRedPacket()

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
