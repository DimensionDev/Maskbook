import { currentPersona } from '@masknet/plugin-infra/dom/context'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    return useSubscription(currentPersona)
}
