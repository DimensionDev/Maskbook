import { useEffect } from 'react'
import { MaskMessages, type SocialIdentity } from '@masknet/shared-base'
import type { IdentityResolved } from '../types.js'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'
import { useQuery } from '@tanstack/react-query'

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const { getSocialIdentity, getNextIDPlatform } = useSiteAdaptorContext()

    const platform = getNextIDPlatform()

    const result = useQuery<SocialIdentity | undefined, Error>({
        queryKey: ['next-id', identity, platform],
        enabled: Boolean(identity && platform),
        queryFn: async () => {
            if (!platform || !identity) return
            return getSocialIdentity(platform, identity)
        },
        refetchOnWindowFocus: false,
    })

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => result.refetch()), [result.refetch])

    return result
}
