import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { currentPersona } from '@masknet/plugin-infra/dom/context'
import type { PersonaInformation } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'

export function useCurrentLinkedPersona(): PersonaInformation | undefined {
    const myPersonas = useAllPersonas()
    const id = useSubscription(currentPersona)
    return myPersonas?.find((x) => x.identifier.rawPublicKey.toLowerCase() === id?.rawPublicKey.toLowerCase())
}
