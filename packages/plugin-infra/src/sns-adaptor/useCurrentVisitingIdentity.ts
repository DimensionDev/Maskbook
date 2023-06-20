import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '../dom/useSNSAdaptorContext.js'

export function useCurrentVisitingIdentity() {
    const { currentVisitingProfile } = useSNSAdaptorContext()
    return useSubscription(currentVisitingProfile ?? UNDEFINED)
}
