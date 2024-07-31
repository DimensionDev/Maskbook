import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { minus, toFixed } from '@masknet/web3-shared-base'
import { isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import type { useAvailability } from '../hooks/useAvailability.js'

type Availability = ReturnType<typeof useAvailability>['data']
export function useRedPacketCover(payload: RedPacketJSONPayload, availability: Availability) {
    const token = payload.token
    const { data } = useQuery({
        enabled: !!availability && !!payload.rpid && !!token?.symbol,
        queryKey: ['red-packet', 'theme-id', payload.rpid, availability?.balance, availability?.claimed],
        queryFn: async () => {
            if (!token || !availability) return null
            const name = payload.sender.name

            // Once a redpacket is refunded, its balance will be 0, that's not the remaining amount
            const remainingAmount = toFixed(minus(payload.total, availability.claimed_amount))
            return FireflyRedPacket.getCoverUrlByRpid(
                payload.rpid,
                token.symbol,
                token.decimals,
                payload.shares,
                payload.total,
                [isValidAddress, isValidDomain, (n: string) => n.startsWith('@')].some((f) => f(name)) ? name : (
                    `@${name}`
                ),
                payload.sender.message,
                remainingAmount,
                toFixed(minus(payload.shares, availability.claimed || 0)),
            )
        },
    })
    return data
}
