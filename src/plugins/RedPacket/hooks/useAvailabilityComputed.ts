import { RedPacketJSONPayload, RedPacketAvailability, RedPacketStatus } from '../types'
import { isSameAddress } from '../../../web3/helpers'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'

export function useAvailabilityComputed(
    from: string,
    availability?: RedPacketAvailability,
    payload?: RedPacketJSONPayload,
) {
    if (!availability || !payload)
        return {
            canClaim: false,
            canRefund: false,
            status: RedPacketStatus.initial,
        }
    const isEmpty = availability.balance === '0'
    const isExpired = availability.expired
    const isClaimed = availability.ifclaimed
    const isRefunded = isEmpty && Number.parseInt(availability.claimed) < Number.parseInt(availability.total)
    const isCreator = isSameAddress(payload?.sender.address ?? '', from)
    return {
        tokenAmount: `${formatBalance(
            new BigNumber(availability.balance),
            payload.token?.decimals ?? 18,
            payload.token?.decimals ?? 18,
        )}`,
        tokenSymbol: `${payload.token?.symbol ?? 'ETH'}`,
        canClaim: !isExpired && !isEmpty && !isClaimed,
        canRefund: isExpired && !isEmpty && isCreator,
        status: isClaimed
            ? RedPacketStatus.claimed
            : isEmpty
            ? RedPacketStatus.empty
            : isRefunded
            ? RedPacketStatus.refunded
            : isExpired
            ? RedPacketStatus.expired
            : RedPacketStatus.initial,
    }
}
