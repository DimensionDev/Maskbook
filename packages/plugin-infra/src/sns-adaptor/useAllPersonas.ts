import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '../dom/useSNSAdaptorContext.js'

export function useAllPersonas() {
    const { allPersonas } = useSNSAdaptorContext()
    return useSubscription(allPersonas ?? EMPTY_ARRAY)
}
