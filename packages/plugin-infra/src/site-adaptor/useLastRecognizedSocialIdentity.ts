import { useSocialIdentity } from './useSocialIdentity.js'
import { useLastRecognizedIdentity } from './useLastRecognizedIdentity.js'
import type { UseQueryResult } from '@tanstack/react-query'
import type { SocialIdentity } from '@masknet/shared-base'

/**
 * Get the social identity of the last recognized identity
 */
export function useLastRecognizedSocialIdentity(): UseQueryResult<SocialIdentity | null> {
    const identity = useLastRecognizedIdentity()
    return useSocialIdentity(identity)
}
