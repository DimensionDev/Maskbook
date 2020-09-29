import { RedPacketStatus } from './types'
import { unreachable } from '../../utils/utils'

export function resolveRedPacketStatus(status: RedPacketStatus) {
    switch (status) {
        case RedPacketStatus.claimed:
            return 'Claimed'
        case RedPacketStatus.expired:
            return 'Expired'
        case RedPacketStatus.refunded:
            return 'Refunded'
        case RedPacketStatus.empty:
            return 'Empty'
        case RedPacketStatus.initial:
            return ''
        default:
            unreachable(status)
    }
}
