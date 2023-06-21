import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '../dom/useSNSAdaptorContext.js'

export function useLastRecognizedIdentity() {
    const { lastRecognizedProfile } = useSNSAdaptorContext()
    return useSubscription(lastRecognizedProfile ?? UNDEFINED)
}
