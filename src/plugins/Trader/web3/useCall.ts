import { useCallCallback } from './useCallback'
import type { TransactionObject } from '../../../contracts/types'
import { useTimes, TimesOptions } from '../../../utils/hooks/useTimes'

/**
 * Create a callback and invoke it n times
 * @param tx
 * @param options
 */
export function useCallByTimes<R, T extends TransactionObject<R>>(tx: T, options: TimesOptions) {
    const callback = useCallCallback<R, T>(tx)
    return useTimes(callback, options)
}

/**
 * Create a callback and invoke it by polling
 * @param tx
 * @param options
 */
export function useCallByPolling<R, T extends TransactionObject<R>>(tx: T, options: Omit<TimesOptions, 'times'>) {
    const callback = useCallCallback<R, T>(tx)
    return useTimes(callback, {
        times: Number.MAX_SAFE_INTEGER,
        ...options,
    })
}
