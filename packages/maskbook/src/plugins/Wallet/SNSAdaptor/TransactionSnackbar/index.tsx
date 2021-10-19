import { useRef, useCallback, useEffect } from 'react'
import { ShowSnackbarOptions, SnackbarKey, SnackbarMessage, useCustomSnackbar } from '@masknet/theme'
import { WalletMessages } from '../../messages'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'

export function TransactionSnackbar() {
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const snackbarKeyRef = useRef<SnackbarKey>()
    const transactions = useRecentTransactions()

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
        return WalletMessages.events.transactionStateUpdated.on((state) => {
            console.log('DEBUG: state updated')
            console.log(state)
            showSingletonSnackbar(state.type, {
                variant: 'success',
            })
        })
    }, [])

    console.log(transactions)

    return null
}
