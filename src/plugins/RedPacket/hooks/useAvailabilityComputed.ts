import { RedPacketJSONPayload, RedPacketAvailability, RedPacketStatus } from '../types'
import { isSameAddress } from '../../../web3/helpers'

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
        canClaim: !isExpired && !isEmpty && !isClaimed,
        canRefund: isExpired && !isEmpty && isCreator,
        status: isClaimed
            ? RedPacketStatus.claimed
            : isRefunded
            ? RedPacketStatus.refunded
            : isExpired
            ? RedPacketStatus.expired
            : isEmpty
            ? RedPacketStatus.empty
            : RedPacketStatus.initial,
    }
}
