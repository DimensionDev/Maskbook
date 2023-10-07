import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { allPersonas, currentPersona } from '../dom/context.js'

export function useCurrentPersonaInformation() {
    const current = useSubscription(currentPersona ?? UNDEFINED)
    const personas = useSubscription(allPersonas)
    return personas?.find((x) => x.identifier.rawPublicKey === current?.rawPublicKey)
}
