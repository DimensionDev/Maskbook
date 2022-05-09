import Services from '../../extension/service'
import { MaskMessages } from '../../utils/messages'
import { createSubscriptionFromAsyncSuspense } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'

const personas = createSubscriptionFromAsyncSuspense(
    () => Services.Identity.queryOwnedPersonaInformation(true),
    MaskMessages.events.ownPersonaChanged.on,
)

export function useMyPersonas() {
    return useSubscription(personas)
}
