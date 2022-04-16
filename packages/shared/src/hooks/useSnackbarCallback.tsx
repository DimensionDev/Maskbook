import { SnackbarType, useCustomSnackbar } from '@masknet/theme'
import { useCallback } from 'react'
import { useSharedI18N } from '../locales'

export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(options: SnackbarCallback<P, T>): P
/** Prefer the first overload. */
export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    executor: P,
    deps: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string,
    type?: SnackbarType,
): P
export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    opts: SnackbarCallback<P, T> | P,
    deps?: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string,
    type?: SnackbarType,
) {
    const t = useSharedI18N()
    const { showSnackbar } = useCustomSnackbar(type)
    const executor = typeof opts === 'function' ? opts : opts.executor
    if (typeof opts === 'object') {
        ;[deps, onSuccess, onError, key, successText, type] = [
            opts.deps,
            opts.onSuccess,
            opts.onError,
            opts.key,
            opts.successText,
            opts.type,
        ]
    }
    return useCallback(
        (...args: any[]) =>
            executor(...args).then(
                (res) => {
                    showSnackbar(successText ?? t.snackbar_done(), {
                        key,
                        variant: 'success',
                        preventDuplicate: true,
                    })
                    onSuccess?.(res)
                    return res
                },
                (error) => {
                    showSnackbar(type !== SnackbarType.POPUP ? `Error: ${error.message || error}` : error.message, {
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

    return useSnackbarCallback(executor, deps ?? [], onSuccess, onError, key, successText, SnackbarType.POPUP)
}

export interface SnackbarCallback<P extends (...args: any[]) => Promise<T>, T> {
    executor: P
    deps: React.DependencyList
    onSuccess?: (ret: T) => void
    onError?: (err: Error) => void
    key?: string
    successText?: string
    type?: SnackbarType
}
