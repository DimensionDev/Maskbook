import { useSNSAdaptorContext } from '@masknet/plugin-infra/dom'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    const context = useSNSAdaptorContext()
    return useSubscription(context.currentPersona)
}

export function useCurrentVisitingProfile() {
    const context = useSNSAdaptorContext()
    return useSubscription(context.currentVisitingProfile)
}

export function useLastRecognizedProfile() {
    const context = useSNSAdaptorContext()
    return useSubscription(context.lastRecognizedProfile)
}

export function useAllPersonas() {
    const context = useSNSAdaptorContext()
    return useSubscription(context.allPersonas!)
}
