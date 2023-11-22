import { useSubscription } from 'use-subscription'
import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import { UNDEFINED, type PersonaInformation } from '@masknet/shared-base'

export function useCurrentLinkedPersona() {
    const context = useSiteAdaptorContext()
    const myPersonas = useAllPersonas()
    const _persona = useSubscription(context?.currentPersona ?? UNDEFINED)
    const currentPersona = myPersonas?.find(
        (x: PersonaInformation) => x.identifier.rawPublicKey.toLowerCase() === _persona?.rawPublicKey.toLowerCase(),
    )

    return currentPersona
}
