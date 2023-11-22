import { UNDEFINED } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'

export function useCurrentPersona() {
    const context = useSiteAdaptorContext()
    return useSubscription(context?.currentPersona ?? UNDEFINED)
}
