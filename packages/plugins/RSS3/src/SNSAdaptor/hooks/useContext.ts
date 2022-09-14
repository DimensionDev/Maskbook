import { context } from '../context.js'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    return useSubscription(context.currentPersona)
}

export function useCurrentVisitingProfile() {
    return useSubscription(context.currentVisitingProfile)
}
