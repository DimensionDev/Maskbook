import { useSubscription } from 'use-subscription'
import { MaskMessages, createSubscriptionFromAsyncSuspense } from '@masknet/shared-base'
import Services from '#services'

const personas = createSubscriptionFromAsyncSuspense(
    () => Services.Identity.queryOwnedPersonaInformation(true),
    MaskMessages.events.ownPersonaChanged.on,
)

/**
 * Get all owned personas from DB
 */
export function usePersonasFromDB() {
    return useSubscription(personas)
}
