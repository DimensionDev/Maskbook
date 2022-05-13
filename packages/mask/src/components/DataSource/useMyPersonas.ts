import Services from '../../extension/service'
import { MaskMessages } from '../../utils/messages'
import { createSubscriptionFromAsyncSuspense } from '@masknet/shared-base'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

const personas = createSubscriptionFromAsyncSuspense(
    () => Services.Identity.queryOwnedPersonaInformation(true),
    MaskMessages.events.ownPersonaChanged.on,
)

export function useMyPersonas() {
    return useSyncExternalStoreWithSelector(
        personas.subscribe,
        personas.getCurrentValue,
        personas.getCurrentValue,
        (s) => s,
    )
}
