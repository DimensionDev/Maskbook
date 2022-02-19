export type DeferTuple<T extends any = any, E extends unknown = unknown> = [
    Promise<T>,
    (value: T | PromiseLike<T>) => void,
    (reason: E) => void,
]

/**
 * !!!! Please use the Promise constructor if possible
 * If you don't understand https://groups.google.com/forum/#!topic/bluebird-js/mUiX2-vXW2s
 */
export function defer<T, E = unknown>(): DeferTuple<T, E> {
    let a!: (val: T | PromiseLike<T>) => void, b!: (err: E) => void
    const p = new Promise<T>((x, y) => {
        a = x
        b = y
    })
    return [p, a, b]
}
