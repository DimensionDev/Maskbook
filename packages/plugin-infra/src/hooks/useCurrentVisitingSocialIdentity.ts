import type { NextIDPlatform } from '@masknet/shared-base'
import { useSocialIdentity } from './useSocialIdentity.js'
import { useCurrentVisitingIdentity } from './useCurrentVisitingIdentity.js'

/**
 * Get the social identity of the current visiting identity
 */
export function useCurrentVisitingSocialIdentity(platform: NextIDPlatform) {
    const identity = useCurrentVisitingIdentity()
    return useSocialIdentity(platform, identity)
}
