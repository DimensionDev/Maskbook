import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import {
    allPersonas,
    lastRecognizedProfile,
    currentVisitingProfile,
} from '@masknet/plugin-infra/content-script/context'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    const context = useSiteAdaptorContext()
    return useSubscription(context.currentPersona)
}

export function useCurrentVisitingProfile() {
    return useSubscription(currentVisitingProfile)
}

export function useLastRecognizedProfile() {
    return useSubscription(lastRecognizedProfile)
}

export function useAllPersonas() {
    return useSubscription(allPersonas)
}
