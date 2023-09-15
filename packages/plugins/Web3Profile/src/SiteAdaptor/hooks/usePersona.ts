import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import { lastRecognizedProfile } from '@masknet/plugin-infra/content-script/context'
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
    return useSubscription(lastRecognizedProfile)
}

export function useAllPersonas() {
    const context = useSiteAdaptorContext()
    return useSubscription(context.allPersonas!)
}
