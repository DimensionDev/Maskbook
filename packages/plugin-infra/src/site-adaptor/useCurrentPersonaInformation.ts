import { useSubscription } from 'use-subscription'
import { allPersonas, currentPersona } from '../dom/context.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'
import type { PersonaInformation } from '@masknet/shared-base'

export function useCurrentPersonaInformation(): PersonaInformation | undefined {
    const current = useSubscriptionMaybe(currentPersona, undefined)
    const personas = useSubscription(allPersonas)
    return personas?.find((x) => x.identifier.rawPublicKey === current?.rawPublicKey)
}
