import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'

export function useAllPersonas() {
    const { allPersonas } = useSiteAdaptorContext()
    return useSubscription(allPersonas ?? EMPTY_ARRAY)
}
