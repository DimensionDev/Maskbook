import { useAsyncFn } from 'react-use'
import Services from '../../../extension/service.js'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn.js'
import type { SignRequestResult } from '../../../../background/services/identity/index.js'

export function usePersonaSign(
    message?: string,
    currentIdentifier?: ECKeyIdentifier,
): AsyncFnReturn<() => Promise<SignRequestResult | undefined>> {
    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            const result = await Services.Identity.signWithPersona({
                method: 'eth',
                message,
                identifier: currentIdentifier,
            })
            return result
        } catch {
            return
        }
    }, [message, currentIdentifier])
}
