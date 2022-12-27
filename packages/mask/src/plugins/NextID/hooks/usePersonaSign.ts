import { useAsyncFn } from 'react-use'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import Services from '../../../extension/service.js'

export function usePersonaSign(message?: string, currentIdentifier?: ECKeyIdentifier) {
    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            return await Services.Identity.signWithPersona({
                method: 'message',
                message,
                identifier: currentIdentifier,
            })
        } catch {
            return
        }
    }, [message, currentIdentifier])
}
