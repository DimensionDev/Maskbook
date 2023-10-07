import {
    allPersonas,
    currentPersona,
    lastRecognizedProfile,
    currentVisitingProfile,
} from '@masknet/plugin-infra/content-script/context'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    return useSubscription(currentPersona)
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
