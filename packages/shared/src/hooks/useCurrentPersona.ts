import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    const context = useSNSAdaptorContext()
    return useSubscription(context.currentPersona)
}
