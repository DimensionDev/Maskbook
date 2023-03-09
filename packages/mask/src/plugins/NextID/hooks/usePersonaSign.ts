import { useAsyncFn } from 'react-use'
import { type ECKeyIdentifier, SignType } from '@masknet/shared-base'
import Services from '../../../extension/service.js'

export function usePersonaSign(message?: string, currentIdentifier?: ECKeyIdentifier) {
    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            return await Services.Identity.signWithPersona(SignType.Message, message, currentIdentifier)
        } catch {
            return
        }
    }, [message, currentIdentifier])
}
