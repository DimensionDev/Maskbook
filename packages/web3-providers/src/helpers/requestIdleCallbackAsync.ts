import type { UnboxPromise } from '@masknet/shared-base'

export function requestIdleCallbackAsync<T extends () => Promise<unknown>, R = UnboxPromise<ReturnType<T>>>(
    callback: T,
    options?: IdleRequestOptions,
): Promise<R> {
    return new Promise<R>((resolve, reject) => {
        requestIdleCallback(async () => {
            try {
                resolve((await callback()) as R)
            } catch (error) {
                reject(error)
            }
        }, options)
    })
}
