import { useDashboardI18N } from '../locales'
import { useSnackbar } from 'notistack'
import { useCallback } from 'react'

export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    executor: P,
    deps: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string,
) {
    const t = useDashboardI18N()
    const { enqueueSnackbar } = useSnackbar()
    return useCallback(
        (...args) =>
            executor(...args).then(
                (res) => {
                    enqueueSnackbar(successText ?? t.done(), { key, variant: 'success', preventDuplicate: true })
                    onSuccess?.(res)
                    return res
                },
                (err) => {
                    enqueueSnackbar(`Error: ${err.message || err}`, { key, preventDuplicate: true })
                    onError?.(err)
                    throw err
                },
            ),
        [...deps, enqueueSnackbar, executor, onError, onSuccess, key, successText],
    )
}
