import { useSubscription, Subscription } from 'use-subscription'
import { Some, None, Err, Result, Ok, Option } from 'ts-results'
/**
 * Create a new global state.
 *
 * @param f The async function that return the data needed.
 * @param subscribe
 * The subscribe function that call the callback when the data changed.
 * It will call the f again to revalidate the data.
 *
 * @returns
 * It returns a tuple.
 *
 * The first item is the react hooks for this resource.
 * The hooks receive a argument "checked".
 * If checked is true, it will return a status object so you can handle the error by yourself.
 *
 * The second item is the revalidation function. It can be called anywhere and returns a Promise.
 * It will resolves regardless the f itself fullfilled or rejected.
 */
export function createGlobalState<T>(f: () => Promise<T>, subscribe: (callback: () => void) => () => void) {
    const listeners = new Set<Function>()

    let currentValue: Option<Result<T, any>> = None
    let pending: Promise<any> | void
    const sub: Subscription<T> = {
        getCurrentValue() {
            if (currentValue.none) {
                subscribe(revalidate)
                throw (pending ||= revalidate())
            }
            if (currentValue.val.err) throw currentValue.val.val
            return currentValue.val.val
        },
        subscribe(f) {
            listeners.add(f)
            return () => listeners.delete(f)
        },
    }
    function useData() {
        return useSubscription(sub)
    }
    function revalidate() {
        return f()
            .then(
                (val) => (currentValue = Some(Ok(val))),
                (err) => (currentValue = Some(Err(err))),
            )
            .then<void>(() => undefined)
            .finally(() => listeners.forEach((f) => f()))
    }
    return [useData, revalidate] as const
}
