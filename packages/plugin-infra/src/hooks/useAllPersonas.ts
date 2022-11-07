import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '../contexts/SNSAdaptorContext.jsx'

export function useAllPersonas() {
    const { allPersonas } = useSNSAdaptorContext()
    return useSubscription(allPersonas ?? EMPTY_ARRAY)
}
