import { useSubscription } from 'use-subscription'
import { createSubscriptionFromAsyncSuspense } from '@masknet/shared-base'
import Services from '../../extension/service'
import { MaskMessages } from '../../utils/messages'

const personas = createSubscriptionFromAsyncSuspense(
    () => Services.Identity.queryOwnedPersonaInformation(true),
    MaskMessages.events.ownPersonaChanged.on,
)

export function useMyPersonas() {
    return useSubscription(personas)
}
