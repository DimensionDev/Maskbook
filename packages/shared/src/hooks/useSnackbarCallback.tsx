import { useSnackbar } from '@masknet/theme'
import { useCallback } from 'react'
import { useMaskThemeI18N } from '../locales'

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
    const t = useMaskThemeI18N()
    const { enqueueSnackbar } = useSnackbar()
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
                    enqueueSnackbar(successText ?? t.snackbar_done(), {
                        key,
                        variant: 'success',
                        preventDuplicate: true,
                    })
                    onSuccess?.(res)
                    return res
                },
                (err) => {
                    enqueueSnackbar(`Error: ${err.message || err}`, { key, preventDuplicate: true })
                    onError?.(err)
                    throw err
                },
            ),
        [...deps!, enqueueSnackbar, executor, onError, onSuccess, key, successText],
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
