import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/dom'
import type { PersonaInformation } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'

export function useCurrentLinkedPersona() {
    const { currentPersona: currentPersona_ } = useSNSAdaptorContext()
    const myPersonas = useAllPersonas()
    const _persona = useSubscription(currentPersona_)
    const currentPersona = myPersonas?.find(
        (x: PersonaInformation) => x.identifier.rawPublicKey.toLowerCase() === _persona?.rawPublicKey.toLowerCase(),
    )

    return currentPersona
}
