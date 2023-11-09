import { useAsyncFn, useUpdateEffect } from 'react-use'
import { useCustomSnackbar } from '@masknet/theme'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useNextID_Trans } from '../locales/index.js'

export const useWalletSign = (message?: string, address?: string) => {
    const t = useNextID_Trans()
    const { showSnackbar } = useCustomSnackbar()

    const [state, fn] = useAsyncFn(
        async (changed: boolean) => {
            if (changed || !address || !message) return
            try {
                showSnackbar(t.notify_wallet_sign(), { processing: true, message: t.notify_wallet_sign_confirm() })
                const result = await EVMWeb3.signMessage('message', message, { account: address })
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
