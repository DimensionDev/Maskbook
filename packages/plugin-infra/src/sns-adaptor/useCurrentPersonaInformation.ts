import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'

export function useCurrentPersonaInformation() {
    const { currentPersona, allPersonas } = useSiteAdaptorContext()
    const current = useSubscription(currentPersona ?? UNDEFINED)
    const personas = useSubscription(allPersonas ?? UNDEFINED)
    return personas?.find((x) => x.identifier.rawPublicKey === current?.rawPublicKey)
}
