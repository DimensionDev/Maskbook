import { useAsyncFn } from 'react-use'
import Services from '../../../extension/service'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'
import type { SignRequestResult } from '../../../../background/services/identity'

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
                identifier: currentIdentifier.toText(),
            })
            return result
        } catch {
            return
        }
    }, [message, currentIdentifier])
}
