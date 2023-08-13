import { useAsyncFn } from 'react-use'
import { type ECKeyIdentifier, SignType } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'

export function usePersonaSign(message?: string, currentIdentifier?: ECKeyIdentifier) {
    const { signWithPersona } = useSiteAdaptorContext()

    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            return await signWithPersona?.(SignType.Message, message, currentIdentifier, location.origin)
        } catch {
            return
        }
    }, [message, currentIdentifier, signWithPersona])
}
