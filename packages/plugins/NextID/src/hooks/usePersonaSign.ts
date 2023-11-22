import { useAsyncFn } from 'react-use'
import { type ECKeyIdentifier, SignType } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'

export function usePersonaSign(message?: string, currentIdentifier?: ECKeyIdentifier) {
    const context = useSiteAdaptorContext()

    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            return await context?.signWithPersona?.(SignType.Message, message, currentIdentifier)
        } catch {
            return
        }
    }, [message, currentIdentifier, context?.signWithPersona])
}
