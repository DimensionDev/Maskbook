import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '../contexts/SNSAdaptorContext.jsx'

export function useLastRecognizedIdentity() {
    const { lastRecognizedProfile } = useSNSAdaptorContext()
    return useSubscription(lastRecognizedProfile ?? UNDEFINED)
}
