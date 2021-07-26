import {
    unstable_createMutableSource as createMutableSource,
    unstable_useMutableSource as useMutableSource,
} from 'react'
/**
 * Create a new global state.
 *
 * This is compatible with concurrent mode.
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
 *
 * The third item is the data itself in case you're not in a React context.
 */
export function createGlobalState<T>(f: () => Promise<T>, subscribe: (callback: () => void) => () => void) {
    const data: { version: number; data: T; error: unknown } = { version: -1, data: null!, error: null }
    const source = createMutableSource(data, () => data.version)
    function snap(x: typeof data) {
        return { ...x }
    }
    const event = new EventTarget()
    function revalidate(callback = (): void => void event.dispatchEvent(new Event('update'))) {
        return f()
            .then(
                (val) => {
                    data.version++
                    data.data = val
                    data.error = undefined
                },
                (err) => {
                    data.version++
                    data.error = err
                },
            )
            .finally(callback)
    }
    function subscriber(x: typeof data, callback: () => void) {
        const undo = subscribe(() => revalidate(callback))
        event.addEventListener('update', callback)
        return () => {
            event.removeEventListener('update', callback)
            undo()
        }
    }

    function useData(checked: true): Result<T>
    function useData(checked?: false): T
    function useData(checked = false): T | Result<T> {
        const val = useMutableSource(source, snap, subscriber) as typeof data
        if (val.version === -1) throw revalidate()
        // there is no any stale data available. considered as not recoverable.
        if (checked) return { error: val.error, data: val.data }
        if (val.error && val.version === 0) throw val.error
        return val.data
    }
    return [useData, () => revalidate(), { value: data.data as Readonly<T>, error: data.error } as const] as const
}
export interface Result<T> {
    error: unknown
    /** In case there is error, the data might be outdated */
    data?: T
}
