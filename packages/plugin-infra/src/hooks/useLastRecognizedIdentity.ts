import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '../contexts/SNSAdaptorContext.js'

export function useLastRecognizedIdentity() {
    const { lastRecognizedProfile } = useSNSAdaptorContext()
    return useSubscription(lastRecognizedProfile ?? UNDEFINED)
}
