import { context } from '../context.js'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    return useSubscription(context.currentPersona)
}

export function useCurrentVisitingProfile() {
    return useSubscription(context.currentVisitingProfile)
}

export function useLastRecognizedProfile() {
    return useSubscription(context.lastRecognizedProfile)
}

export function useAllPersonas() {
    return useSubscription(context.allPersonas!)
}
