import { useLastRecognizedIdentity } from './useLastRecognizedIdentity.js'
import { useSocialIdentity } from './useSocialIdentity.js'

/**
 * Get the social identity of the last recognized identity
 */
export function useLastRecognizedSocialIdentity() {
    const identity = useLastRecognizedIdentity()
    return useSocialIdentity(identity)
}
