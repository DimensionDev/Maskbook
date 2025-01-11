import { useAsyncFn, useUpdateEffect } from 'react-use'
import { useCustomSnackbar } from '@masknet/theme'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useLingui } from '@lingui/react/macro'

export const useWalletSign = (message?: string, address?: string) => {
    const { t } = useLingui()
    const { showSnackbar } = useCustomSnackbar()

    const [state, fn] = useAsyncFn(
        async (changed: boolean) => {
            if (changed || !address || !message) return
            try {
                showSnackbar(t`Wallet Sign`, {
                    processing: true,
                    message: t`Confirm this transaction in your wallet.`,
                })
                const result = await EVMWeb3.signMessage('message', message, { account: address })
                return result
            } catch {
                showSnackbar(t`Wallet Sign`, { variant: 'error', message: t`Wallet sign cancelled.` })
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
