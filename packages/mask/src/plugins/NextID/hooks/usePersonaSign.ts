import { useAsyncFn } from 'react-use'
import Services from '../../../extension/service'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { useI18N } from '../locales'
import { useCustomSnackbar } from '@masknet/theme'

export const usePersonaSign = (message?: string, currentIdentifier?: ECKeyIdentifier) => {
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()
    return useAsyncFn(async () => {
        if (!message || !currentIdentifier) return
        try {
            showSnackbar(t.notify_persona_sign(), { processing: true, message: t.notify_persona_sign_confirm() })
            const result = await Services.Identity.signWithPersona({
                method: 'eth',
                message: message,
                identifier: currentIdentifier.toText(),
            })
            return result
        } catch {
            showSnackbar(t.notify_persona_sign(), { variant: 'error', message: t.notify_persona_sign_cancel() })
            return
        }
    }, [message, currentIdentifier])
}
