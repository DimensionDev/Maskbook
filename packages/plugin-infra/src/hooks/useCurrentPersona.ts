import { useSNSAdaptorContext } from '../sns-adaptor/SNSAdaptorContext.js'
import { useSubscription } from 'use-subscription'
import { UNDEFINED, PersonaIdentifier } from '@masknet/shared-base'

export function useCurrentPersona() {
    const { currentPersona } = useSNSAdaptorContext()
    return useSubscription<PersonaIdentifier | undefined>(currentPersona ?? UNDEFINED)
}
