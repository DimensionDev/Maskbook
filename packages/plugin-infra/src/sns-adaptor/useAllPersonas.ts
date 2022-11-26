import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { useSNSAdaptorContext } from './SNSAdaptorContext.js'

export function useAllPersonas() {
    const { allPersonas } = useSNSAdaptorContext()
    return useSubscription(allPersonas ?? EMPTY_ARRAY)
}
