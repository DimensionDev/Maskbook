import { EVM_RPC } from '@masknet/plugin-evm/src/messages'
import { useCustomSnackbar } from '@masknet/theme'
import { useAsyncFn, useUpdateEffect } from 'react-use'
import { useI18N } from '../locales'

export const useWalletSign = (message?: string, address?: string) => {
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()

    const [state, fn] = useAsyncFn(
        async (changed: boolean) => {
            if (changed) return undefined
            if (!address || !message) return
            try {
                showSnackbar(t.notify_wallet_sign(), { processing: true, message: t.notify_wallet_sign_confirm() })
                const result = await EVM_RPC.personalSign(message, address)
                return result
            } catch {
                showSnackbar(t.notify_wallet_sign(), { variant: 'error', message: t.notify_wallet_sign_cancel() })
                return
            }
        },
        [address, message, address],
    )

    useUpdateEffect(() => {
        fn(true)
    }, [address])

    return [state, () => fn(false)] as const
}
