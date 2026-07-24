import { useLingui } from '@lingui/react/macro'
import { useLensClient, useMyLensAccount } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useSnackbar, type ShowMaskSnackbarOptions, type SnackbarKey, type SnackbarMessage } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useCallback, useRef, useState } from 'react'

export interface UnfollowOptions {
    accountAddress?: string
    onSuccess?: () => void
    onFailed?: () => void
}

export function useUnfollow({ accountAddress, onSuccess, onFailed }: UnfollowOptions) {
    const { t } = useLingui()
    const [loading, setLoading] = useState(false)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const snackbarKeyRef = useRef<SnackbarKey>(undefined)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const showSingletonSnackbar = useCallback(
        (title: SnackbarMessage, options: ShowMaskSnackbarOptions) => {
            if (snackbarKeyRef.current !== undefined) closeSnackbar(snackbarKeyRef.current)
            snackbarKeyRef.current = enqueueSnackbar(title, options)
            return () => {
                closeSnackbar(snackbarKeyRef.current)
            }
        },
        [enqueueSnackbar, closeSnackbar],
    )

    const myLensAccount = useMyLensAccount()
    const lensClient = useLensClient()
    const handleUnfollow = useCallback(async () => {
        try {
            setLoading(true)
            if (!accountAddress || chainId !== ChainId.Polygon) return
            if (!lensClient || !myLensAccount) return
            await lensClient.login(myLensAccount)
            const res = await lensClient.unfollow(accountAddress)
            if (res.isErr()) {
                throw res.error
            }
            onSuccess?.()
        } catch (error) {
            if (!Error.isError(error)) return
            const message = error.message
            if (
                !message.includes('Transaction was rejected') &&
                !message.includes('Signature canceled') &&
                !message.includes('User rejected the request') &&
                !message.includes('User rejected transaction') &&
                !message.includes('RPC Error')
            ) {
                onFailed?.()
                showSingletonSnackbar(t`Unfollow lens handle`, {
                    processing: false,
                    variant: 'error',
                    detail: t`Network error, try again`,
                })
            }
        } finally {
            setLoading(false)
        }
    }, [accountAddress, chainId, lensClient, myLensAccount, onFailed, onSuccess, showSingletonSnackbar, t])

    return { loading, handleUnfollow }
}
