import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useSubscription } from 'use-subscription'

export function useCurrentPersona() {
    const context = useSiteAdaptorContext()
    return useSubscription(context.currentPersona)
}
