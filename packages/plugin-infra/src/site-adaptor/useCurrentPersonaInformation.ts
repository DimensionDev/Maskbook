import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '../dom/useSiteAdaptorContext.js'
import { allPersonas } from '../dom/context.js'

export function useCurrentPersonaInformation() {
    const context = useSiteAdaptorContext()
    const current = useSubscription(context?.currentPersona ?? UNDEFINED)
    const personas = useSubscription(allPersonas)
    return personas?.find((x) => x.identifier.rawPublicKey === current?.rawPublicKey)
}
