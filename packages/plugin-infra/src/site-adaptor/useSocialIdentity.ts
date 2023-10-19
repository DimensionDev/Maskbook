import { useEffect } from 'react'
import { MaskMessages, type SocialIdentity } from '@masknet/shared-base'
import type { IdentityResolved } from '../types.js'
import { useQuery } from '@tanstack/react-query'
import { currentNextIDPlatform } from './context.js'
import { querySocialIdentity } from '../dom/context.js'

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const result = useQuery<SocialIdentity | undefined, Error>({
        queryKey: ['next-id', identity, currentNextIDPlatform],
        enabled: Boolean(identity && currentNextIDPlatform),
        queryFn: async () => {
            if (!currentNextIDPlatform || !identity) return
            return querySocialIdentity(currentNextIDPlatform, identity)
        },
        refetchOnWindowFocus: false,
    })

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => result.refetch()), [result.refetch])

    return result
}
