import { useEffect } from 'react'
import { MaskMessages } from '@masknet/shared-base'
import type { IdentityResolved } from '../types.js'
import { useQuery } from '@tanstack/react-query'
import { querySocialIdentity } from '../dom/context.js'

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const result = useQuery({
        queryKey: ['social-identity', identity],
        enabled: Boolean(identity),
        queryFn: async () => {
            if (!identity) return null
            return (await querySocialIdentity(identity)) || null
        },
        refetchOnWindowFocus: false,
    })

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => result.refetch()), [result.refetch])

    return result
}
