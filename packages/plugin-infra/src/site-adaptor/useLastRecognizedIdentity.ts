import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'

export function useLastRecognizedIdentity() {
    const { lastRecognizedProfile } = useSiteAdaptorContext()
    return useSubscription(lastRecognizedProfile ?? UNDEFINED)
}
