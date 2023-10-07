import { currentPersona } from '@masknet/plugin-infra/content-script/context'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    return useSubscription(currentPersona)
}
