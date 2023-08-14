import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    const context = useSiteAdaptorContext()
    return useSubscription(context.currentPersona)
}

export function useCurrentVisitingProfile() {
    const context = useSiteAdaptorContext()
    return useSubscription(context.currentVisitingProfile)
}

export function useLastRecognizedProfile() {
    const context = useSiteAdaptorContext()
    return useSubscription(context.lastRecognizedProfile)
}

export function useAllPersonas() {
    const context = useSiteAdaptorContext()
    return useSubscription(context.allPersonas!)
}
