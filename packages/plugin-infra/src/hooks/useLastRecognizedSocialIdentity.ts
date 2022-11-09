import type { NextIDPlatform } from '@masknet/shared-base'
import { useSocialIdentity } from './useSocialIdentity.js'
import { useLastRecognizedIdentity } from './useLastRecognizedIdentity.js'

/**
 * Get the social identity of the last recognized identity
 */
export function useLastRecognizedSocialIdentity(platform: NextIDPlatform) {
    const identity = useLastRecognizedIdentity()
    return useSocialIdentity(platform, identity)
}
