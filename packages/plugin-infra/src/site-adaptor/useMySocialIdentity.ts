import { useSocialIdentity } from './useSocialIdentity.js'
import { useMyIdentity } from './useMyIdentity.js'
import type { UseQueryResult } from '@tanstack/react-query'

type T = UseQueryResult

/**
 * Get the social identity of the last recognized identity
 */
export function useMySocialIdentity() {
    const identity = useMyIdentity()
    return useSocialIdentity(identity)
}
