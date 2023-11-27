import { useSocialIdentity } from './useSocialIdentity.js'
import { useLastRecognizedIdentity } from './useLastRecognizedIdentity.js'
import type { UseQueryResult } from '@tanstack/react-query'

type T = UseQueryResult

/**
 * Get the social identity of the last recognized identity
 */
export function useLastRecognizedSocialIdentity() {
    const identity = useLastRecognizedIdentity()
    return useSocialIdentity(identity)
}
