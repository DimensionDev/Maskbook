import { useSocialIdentity } from './useSocialIdentity.js'
import { useCurrentVisitingIdentity } from './useCurrentVisitingIdentity.js'
import type { UseQueryResult } from '@tanstack/react-query'
import type { SocialIdentity } from '@masknet/shared-base'

/**
 * Get the social identity of the current visiting identity
 */
export function useCurrentVisitingSocialIdentity(): UseQueryResult<SocialIdentity | null> {
    const identity = useCurrentVisitingIdentity()
    return useSocialIdentity(identity)
}
