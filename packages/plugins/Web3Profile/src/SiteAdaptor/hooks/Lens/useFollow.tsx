import { type EvmAddress } from '@lens-protocol/client'
import { Trans, useLingui } from '@lingui/react/macro'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useCustomSnackbar, type ShowSnackbarOptions, type SnackbarKey, type SnackbarMessage } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useCallback, useRef, useState } from 'react'
import { useLensClient } from './useLensClient.js'
import { useMyLensAccountAddress } from './useMyLensAccountAddress.js'

export type FollowOptions = {
    accountAddress?: EvmAddress
    onSuccess?: (width: number, height: number) => void
    onFailed?: () => void
}

export function useFollow({ accountAddress, onFailed }: FollowOptions) {
    const { t } = useLingui()
    const [loading, setLoading] = useState(false)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const snackbarKeyRef = useRef<SnackbarKey>(undefined)
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()

    const showSingletonSnackbar = useCallback(
        (title: SnackbarMessage, options: ShowSnackbarOptions) => {
            if (snackbarKeyRef.current !== undefined) closeSnackbar(snackbarKeyRef.current)
            snackbarKeyRef.current = showSnackbar(title, options)
            return () => {
                closeSnackbar(snackbarKeyRef.current)
            }
        },
        [showSnackbar, closeSnackbar],
    )

    const myLensAccount = useMyLensAccountAddress()
    const lensClient = useLensClient()

    const handleFollow = useCallback<() => Promise<void>>(async () => {
        try {
            setLoading(true)
            if (!accountAddress || chainId !== ChainId.Polygon) return
            if (!lensClient || !myLensAccount) return
            await lensClient.login(myLensAccount)
            const res = await lensClient.follow(accountAddress)
            if (res.isErr()) {
                throw res.error
            }
        } catch (error) {
            if (!(error instanceof Error)) return
            const message = error.message
            if (message.match(/Bad user input .* is already following/)) {
                showSingletonSnackbar(t`Follow Lens handle`, {
                    processing: false,
                    variant: 'warning',
                    message: <Trans>Already following</Trans>,
                })
            } else if (
                !message.includes('Transaction was rejected') &&
                !message.includes('Signature canceled') &&
                !message.includes('User rejected the request') &&
                !message.includes('User rejected transaction') &&
                !message.includes('RPC Error')
            ) {
                onFailed?.()
                showSingletonSnackbar(t`Follow Lens handle`, {
                    processing: false,
                    variant: 'error',
                    message: <Trans>Network error, try again: {error.message}</Trans>,
                })
            }
        } finally {
            setLoading(false)
        }
    }, [accountAddress, chainId, lensClient, myLensAccount, onFailed, showSingletonSnackbar, t])

    return { loading, handleFollow }
}
