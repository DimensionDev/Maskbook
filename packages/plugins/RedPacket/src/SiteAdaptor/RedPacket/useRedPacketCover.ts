import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { useAvailability } from '../hooks/useAvailability.js'
import { FireflyRedPacket } from '@masknet/web3-providers'
import { useMemo } from 'react'
import { isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import { minus, toFixed } from '@masknet/web3-shared-base'

type Availability = ReturnType<typeof useAvailability>['data']
type T = UseQueryResult
export function useRedPacketCover(payload: RedPacketJSONPayload, availability: Availability) {
    const { data: theme } = useQuery({
        queryKey: ['red-packet', 'theme-by-id', payload.rpid],
        queryFn: async () => FireflyRedPacket.getThemeById(payload.rpid),
    })
    const token = payload.token
    const themeCover = useMemo(() => {
        if (!token || !availability || !theme) return null
        const name = payload.sender.name
        return FireflyRedPacket.composeRedPacketCover(
            theme.tid,
            token.symbol,
            token.decimals,
            payload.shares,
            payload.total,
            [isValidAddress, isValidDomain, (n: string) => n.startsWith('@')].some((f) => f(name)) ? name : `@${name}`,
            payload.sender.message,
            availability.balance ?? payload.total,
            toFixed(minus(payload.shares, availability.claimed || 0)),
        )
    }, [theme?.tid, token, payload])
    // Just discard default theme, and this RedPacket will be treated as created from Mask
    if (!theme || theme.is_default) return null
    return {
        backgroundImageUrl: theme.normal.bg_image,
        backgroundColor: theme.normal.bg_color,
        url: themeCover,
    }
}
