import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages, type SocialIdentity } from '@masknet/shared-base'
import type { IdentityResolved } from '../types.js'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const { getSocialIdentity, getNextIDPlatform } = useSiteAdaptorContext()

    const result = useAsyncRetry<SocialIdentity | undefined>(async () => {
        if (!identity) return

        const platform = getNextIDPlatform()
        if (!platform) return

        return getSocialIdentity(platform, identity)
    }, [identity])

    useEffect(() => MaskMessages.events.ownProofChanged.on(result.retry), [result.retry])

    return result
}
