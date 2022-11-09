import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import type { NextIDPlatform } from '@masknet/shared-base'
import type { IdentityResolved } from '../types.js'
import { useSNSAdaptorContext } from '../contexts/SNSAdaptorContext.js'

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(platform: NextIDPlatform, identity: IdentityResolved | null | undefined) {
    const { ownProofChanged, getSocialIdentity } = useSNSAdaptorContext()

    const result = useAsyncRetry<SocialIdentity | undefined>(async () => {
        if (!identity) return
        return getSocialIdentity(platform, identity)
    }, [identity])

    useEffect(() => ownProofChanged.on(result.retry), [result.retry])

    return result
}
