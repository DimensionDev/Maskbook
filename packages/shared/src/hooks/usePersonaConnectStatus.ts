import { useMemo } from 'react'
import type { PersonaInformation } from '@masknet/shared-base'
import { useAllPersonas, useLastRecognizedIdentity, useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'

export function usePersonaConnectStatus(): {
    action?: () => void
    connected: boolean
    hasPersona: boolean
    currentPersona?: PersonaInformation
} {
    const personas = useAllPersonas()
    const lastRecognized = useLastRecognizedIdentity()
    const context = useSiteAdaptorContext()

    return useMemo(() => {
        const id = lastRecognized?.identifier
        const currentPersona = personas.find((x) => id && x.linkedProfiles.some((x) => x.identifier === id))
        return {
            action: !personas.length ? context?.createPersona : !currentPersona ? context?.connectPersona : undefined,
            currentPersona,
            connected: !!currentPersona,
            hasPersona: !!personas.length,
        }
    }, [personas, lastRecognized?.identifier?.toText(), context?.createPersona, context?.connectPersona])
}
