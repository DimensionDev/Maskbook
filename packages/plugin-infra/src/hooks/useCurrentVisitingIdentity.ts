import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '../contexts/SNSAdaptorContext.jsx'

export function useCurrentVisitingIdentity() {
    const { currentVisitingProfile } = useSNSAdaptorContext()
    return useSubscription(currentVisitingProfile ?? UNDEFINED)
}
