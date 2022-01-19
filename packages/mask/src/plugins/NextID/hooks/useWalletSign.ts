import { useCustomSnackbar } from '@masknet/theme'
import { useAsyncFn } from 'react-use'
import Services from '../../../extension/service'
import { useI18N } from '../locales'

export const useWalletSign = (message?: string, address?: string) => {
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()

    return useAsyncFn(async () => {
        if (!address || !message) return
        try {
            showSnackbar(t.notify_wallet_sign(), { variant: 'info', message: t.notify_wallet_sign_confirm() })
            const result = await Services.Ethereum.personalSign(message, address)
            return result
        } catch {
            showSnackbar(t.notify_wallet_sign(), { variant: 'error', message: t.notify_wallet_sign_cancel() })
            return
        }
    }, [address, message])
}
