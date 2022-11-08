import { useCurrentVisitingIdentity } from "./useCurrentVisitingIdentity.js"
import { useSocialIdentity } from "./useSocialIdentity.js"

/**
 * Get the social identity of the current visiting identity
 */
 export function useCurrentVisitingSocialIdentity() {
    const identity = useCurrentVisitingIdentity()
    return useSocialIdentity(identity)
}