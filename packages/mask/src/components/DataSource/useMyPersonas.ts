import { useSubscription } from 'use-subscription'
import Services from '../../extension/service'
import { createSubscriptionFromAsyncSuspense } from '@masknet/shared-base'
import { MaskMessages } from '../../utils/messages'

const personas = createSubscriptionFromAsyncSuspense(
    () => Services.Identity.queryOwnedPersonaInformation(true),
    MaskMessages.events.ownPersonaChanged.on,
)

export function useMyPersonas() {
    return useSubscription(personas)
}
