/**
 * !!!! Please use the Promise constructor if possible
 * If you don't understand https://groups.google.com/forum/#!topic/bluebird-js/mUiX2-vXW2s
 */
export function defer<T, E = unknown>(): [promise: Promise<T>, resolver: (val: T) => void, reject: (err: E) => void] {
    let a!: (val: T) => void, b!: (err: E) => void
    const p = new Promise<T>((x, y) => {
        a = x
        b = y
    })
    return [p, a, b]
}
