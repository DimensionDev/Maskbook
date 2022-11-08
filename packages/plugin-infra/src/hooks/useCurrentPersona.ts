import { useSNSAdaptorContext } from '../contexts/SNSAdaptorContext.js'
import { useSubscription } from 'use-subscription'
import { UNDEFINED, PersonaIdentifier } from '@masknet/shared-base'

export function useCurrentPersona() {
    const { currentPersona } = useSNSAdaptorContext()
    return useSubscription<PersonaIdentifier | undefined>(currentPersona ?? UNDEFINED)
}
