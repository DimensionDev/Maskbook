import { useCustomSnackbar } from '@masknet/theme'
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
): P
export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    opts: SnackbarCallback<P, T> | P,
    deps?: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string,
) {
    const t = useSharedI18N()
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
        (...args) =>
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
                    showSnackbar(`Error: ${error.message || error}`, {
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
