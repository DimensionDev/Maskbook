import { allPersonas, currentPersona, lastRecognizedProfile } from '@masknet/plugin-infra/content-script/context'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    return useSubscription(currentPersona)
}

export function useLastRecognizedProfile() {
    return useSubscription(lastRecognizedProfile)
}

export function useAllPersonas() {
    return useSubscription(allPersonas)
}
