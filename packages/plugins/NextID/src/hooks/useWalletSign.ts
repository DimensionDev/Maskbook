import { useAsyncFn, useUpdateEffect } from 'react-use'
import { useCustomSnackbar } from '@masknet/theme'
import { EVMWeb3 } from '@masknet/web3-providers'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export const useWalletSign = (message?: string, address?: string) => {
    const { _ } = useLingui()
    const { showSnackbar } = useCustomSnackbar()

    const [state, fn] = useAsyncFn(
        async (changed: boolean) => {
            if (changed || !address || !message) return
            try {
                showSnackbar(_(msg`Wallet Sign`), {
                    processing: true,
                    message: _(msg`Confirm this transaction in your wallet.`),
                })
                const result = await EVMWeb3.signMessage('message', message, { account: address })
                return result
            } catch {
                showSnackbar(_(msg`Wallet Sign`), { variant: 'error', message: _(msg`Wallet sign cancelled.`) })
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
