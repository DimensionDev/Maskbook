import { useCallCallback } from './useCallback'
import type { TransactionObject } from '../../contracts/types'
import { useAsyncTimes, AsyncTimesOptions } from '../../utils/hooks/useAsyncTimes'

/**
 * Create a callback and invoke it n times
 * @param tx
 * @param options
 */
export function useCallByTimes<R, T extends TransactionObject<R>>(tx: T, options: AsyncTimesOptions) {
    const callback = useCallCallback<R, T>(tx)
    return useAsyncTimes(callback, options)
}

/**
 * Create a callback and invoke it by polling
 * @param tx
 * @param options
 */
export function useCallByPolling<R, T extends TransactionObject<R>>(tx: T, options: Omit<AsyncTimesOptions, 'times'>) {
    const callback = useCallCallback<R, T>(tx)
    return useAsyncTimes(callback, {
        times: Number.MAX_SAFE_INTEGER,
        ...options,
    })
}
