import { useCallback } from 'react'
import { useCustomSnackbar, usePopupCustomSnackbar } from '@masknet/theme'
import { Trans } from '@lingui/macro'

export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(options: SnackbarCallback<P, T>): P
/** Prefer the first overload. */
export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    executor: P,
    deps: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string | React.ReactNode,
    errorText?: string | React.ReactNode,
): P
export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    opts: SnackbarCallback<P, T> | P,
    deps?: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string | React.ReactNode,
    errorText?: string | React.ReactNode,
) {
    const { showSnackbar } = useCustomSnackbar()
    const executor = typeof opts === 'function' ? opts : opts.executor
    if (typeof opts === 'object') {
        ;[deps, onSuccess, onError, key, successText] = [
            opts.deps,
            opts.onSuccess,
            opts.onError,
            opts.key,
            opts.successText,
        ]
    }
    return useCallback(
        (...args: any[]) =>
            executor(...args).then(
                (res) => {
                    showSnackbar(successText ?? <Trans>Done</Trans>, {
                        key,
                        variant: 'success',
                        preventDuplicate: true,
                    })
                    onSuccess?.(res)
                    return res
                },
                (error) => {
                    showSnackbar(errorText ?? `Error: ${error.message || error}`, {
                        key,
                        preventDuplicate: true,
                        variant: 'error',
                    })
                    onError?.(error)
                    throw error
                },
            ),
        [...deps!, showSnackbar, executor, onError, onSuccess, key, successText, errorText],
    )
}

export function usePopupSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    options: Omit<SnackbarCallback<P, T>, 'type'>,
): P

export function usePopupSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    opts: SnackbarCallback<P, T> | P,
    deps?: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string,
) {
    const { showSnackbar } = usePopupCustomSnackbar()
    const executor = typeof opts === 'function' ? opts : opts.executor
    if (typeof opts === 'object') {
        ;[deps, onSuccess, onError, key, successText] = [
            opts.deps,
            opts.onSuccess,
            opts.onError,
            opts.key,
            opts.successText,
        ]
    }
    return useCallback(
        (...args: any[]) =>
            executor(...args).then(
                (res) => {
                    showSnackbar(successText ?? <Trans>Done</Trans>, {
                        key,
                        variant: 'success',
                        preventDuplicate: true,
                    })
                    onSuccess?.(res)
                    return res
                },
                (error) => {
                    showSnackbar(error.message, {
                        key,
                        preventDuplicate: true,
                        variant: 'error',
                    })
                    onError?.(error)
                    throw error
                },
            ),
        [...deps!, showSnackbar, executor, onError, onSuccess, key, successText],
    )
}

export interface SnackbarCallback<P extends (...args: any[]) => Promise<T>, T> {
    executor: P
    deps: React.DependencyList
    onSuccess?: (ret: T) => void
    onError?: (err: Error) => void
    key?: string
    successText?: string
}
