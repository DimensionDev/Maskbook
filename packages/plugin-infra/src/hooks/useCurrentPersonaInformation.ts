import { UNDEFINED } from '@masknet/shared-base'
import { useSubscription } from 'use-subscription'
import { useSNSAdaptorContext } from '../sns-adaptor/SNSAdaptorContext.js'

export function useCurrentPersonaInformation() {
    const { currentPersona, allPersonas } = useSNSAdaptorContext()
    const current = useSubscription(currentPersona ?? UNDEFINED)
    const personas = useSubscription(allPersonas ?? UNDEFINED)
    return personas?.find((x) => x.identifier.rawPublicKey === current?.rawPublicKey)
}
