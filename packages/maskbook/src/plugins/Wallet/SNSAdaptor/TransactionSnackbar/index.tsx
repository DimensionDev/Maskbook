import { useRef, useCallback, useEffect } from 'react'
import { TransactionStateType } from '@masknet/web3-shared-evm'
import { ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { WalletMessages } from '../../messages'

export function TransactionSnackbar() {
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const snackbarKeyRef = useRef<SnackbarKey>()

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

    useEffect(() => {
        return WalletMessages.events.transactionProgressUpdated.on((progress) => {
            console.log('DEBUG: progress updated')
            console.log(progress)
            showSingletonSnackbar(TransactionStateType[progress.state.type], {
                variant: 'success',
            })
        })
    }, [])

    return null
}
