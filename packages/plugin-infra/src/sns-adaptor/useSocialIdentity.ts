import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { SocialIdentity } from '@masknet/shared-base'
import type { IdentityResolved } from '../types.js'
import { useSNSAdaptorContext } from '../dom/useSNSAdaptorContext.js'

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const { ownProofChanged, getSocialIdentity, getNextIDPlatform } = useSNSAdaptorContext()

    const result = useAsyncRetry<SocialIdentity | undefined>(async () => {
        if (!identity) return

        const platform = getNextIDPlatform()
        if (!platform) return

        return getSocialIdentity(platform, identity)
    }, [identity])

    useEffect(() => ownProofChanged.on(result.retry), [result.retry])

    return result
}
