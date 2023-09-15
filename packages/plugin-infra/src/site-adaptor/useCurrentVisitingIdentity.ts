import { useSubscription } from 'use-subscription'
import { currentVisitingProfile } from './context.js'

export function useCurrentVisitingIdentity() {
    return useSubscription(currentVisitingProfile)
}
