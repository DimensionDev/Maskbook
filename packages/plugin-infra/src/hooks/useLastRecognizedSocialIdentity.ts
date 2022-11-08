import { useSocialIdentity } from './useSocialIdentity.js'
import { useLastRecognizedIdentity } from './useLastRecognizedIdentity.js'

/**
 * Get the social identity of the last recognized identity
 */
export function useLastRecognizedSocialIdentity() {
    const identity = useLastRecognizedIdentity()
    return useSocialIdentity(identity)
}
