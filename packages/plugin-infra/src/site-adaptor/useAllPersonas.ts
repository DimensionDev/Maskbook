import { useSubscription } from 'use-subscription'
import { allPersonas } from '../dom/context.js'
import type { PersonaInformation } from '@masknet/shared-base'

export function useAllPersonas(): readonly PersonaInformation[] {
    return useSubscription(allPersonas)
}
