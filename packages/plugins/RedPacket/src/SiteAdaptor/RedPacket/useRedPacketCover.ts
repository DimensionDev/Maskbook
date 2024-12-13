import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { minus, toFixed } from '@masknet/web3-shared-base'
import { isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import type { useAvailability } from '../hooks/useAvailability.js'

type Availability = ReturnType<typeof useAvailability>['data']
export function useRedPacketCover(payload: RedPacketJSONPayload, availability: Availability) {
    const token = payload.token
    const symbol = token?.symbol
    const decimals = token?.decimals
    return useQuery({
        enabled: !!availability && !!payload.rpid && !!symbol,
        queryKey: [
            'red-packet',
            'theme-id',
            payload.rpid,
            symbol,
            decimals,
            availability?.balance,
            availability?.claimed,
        ],
        queryFn: async () => {
            if (!symbol || !decimals || !availability) return null
            const name = payload.sender.name

            return FireflyRedPacket.getCoverUrlByRpid(
                payload.rpid,
                symbol,
                decimals,
                payload.shares,
                payload.total,
                [isValidAddress, isValidDomain, (n: string) => n.startsWith('@')].some((f) => f(name)) ? name : (
                    `@${name}`
                ),
                payload.sender.message,
                availability.balance ?? payload.total,
                toFixed(minus(payload.shares, availability.claimed || 0)),
            )
        },
    })
}
