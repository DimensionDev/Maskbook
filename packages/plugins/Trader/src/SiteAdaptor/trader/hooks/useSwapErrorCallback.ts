import { type SnackbarKey, useCustomSnackbar, type SnackbarMessage, type ShowSnackbarOptions } from '@masknet/theme'
import { useRef, useCallback } from 'react'
import { useI18N } from '../../../locales/i18n_generated.js'

export function useSwapErrorCallback() {
    const t = useI18N()
    const snackbarKeyRef = useRef<SnackbarKey>()
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

    return useCallback(
        (message: string) => {
            if (message.includes('User rejected transaction') || message.includes('Transaction was rejected')) return
            showSingletonSnackbar(t.swap_failed(), {
                processing: false,
                variant: 'error',
                message: t.swap_failed_description(),
            })
        },
        [showSingletonSnackbar],
    )
}
