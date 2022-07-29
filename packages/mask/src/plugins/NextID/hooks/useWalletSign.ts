import { useAsyncFn, useUpdateEffect } from 'react-use'
import { useCustomSnackbar } from '@masknet/theme'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useI18N } from '../locales'

export const useWalletSign = (message?: string, address?: string) => {
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    const [state, fn] = useAsyncFn(
        async (changed: boolean) => {
            if (changed || !address || !message || !connection) return
            try {
                showSnackbar(t.notify_wallet_sign(), { processing: true, message: t.notify_wallet_sign_confirm() })
                const result = await connection.signMessage(message, 'personalSign', { account: address })
                return result
            } catch {
                showSnackbar(t.notify_wallet_sign(), { variant: 'error', message: t.notify_wallet_sign_cancel() })
                return
            }
        },
        [address, message, address, connection],
    )

    useUpdateEffect(() => {
        fn(true)
    }, [address])

    return [state, () => fn(false)] as const
}
