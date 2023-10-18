import { useAsyncFn } from 'react-use'
import { type ECKeyIdentifier, SignType } from '@masknet/shared-base'
import { signWithPersona } from '@masknet/plugin-infra/dom/context'

export function usePersonaSign(message?: string, currentIdentifier?: ECKeyIdentifier) {
    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            return await signWithPersona?.(SignType.Message, message, currentIdentifier)
        } catch {
            return
        }
    }, [message, currentIdentifier])
}
