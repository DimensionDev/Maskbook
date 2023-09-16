import { useSubscription } from 'use-subscription'
import { allPersonas } from '../dom/context.js'

export function useAllPersonas() {
    return useSubscription(allPersonas)
}
