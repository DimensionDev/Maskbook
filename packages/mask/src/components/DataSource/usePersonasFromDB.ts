import { useSubscription } from 'use-subscription'
import { createSubscriptionFromAsyncSuspense } from '@masknet/shared-base'
import Services from '../../extension/service.js'
import { MaskMessages } from '../../utils/messages.js'

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
