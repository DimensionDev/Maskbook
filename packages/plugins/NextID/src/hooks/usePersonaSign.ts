import { useAsyncFn } from 'react-use'
import { type ECKeyIdentifier, SignType } from '@masknet/shared-base'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/dom'

export function usePersonaSign(message?: string, currentIdentifier?: ECKeyIdentifier) {
    const { signWithPersona } = useSNSAdaptorContext()

    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            return await signWithPersona?.(SignType.Message, message, currentIdentifier)
        } catch {
            return
        }
    }, [message, currentIdentifier, signWithPersona])
}
