import { useMemo } from 'react'
import type { PersonaInformation } from '@masknet/shared-base'
import { useAllPersonas, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { connectPersona } from '@masknet/plugin-infra/content-script/context'
import { createPersona } from '@masknet/plugin-infra/dom/context'

export function usePersonaConnectStatus(): {
    action?: () => void
    connected: boolean
    hasPersona: boolean
    currentPersona?: PersonaInformation
} {
    const personas = useAllPersonas()
    const lastRecognized = useLastRecognizedIdentity()?.identifier

    return useMemo(() => {
        const currentPersona = personas.find(
            (x) => lastRecognized && x.linkedProfiles.some((x) => x.identifier === lastRecognized),
        )
        return {
            /** @deprecated */
            action:
                !personas.length ? createPersona
                : !currentPersona ? connectPersona
                : undefined,
            currentPersona,
            connected: !!currentPersona,
            hasPersona: !!personas.length,
        }
    }, [personas, lastRecognized])
}
