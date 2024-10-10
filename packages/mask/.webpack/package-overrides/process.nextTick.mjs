export default (callback, ...rest) => {
    if (typeof callback !== 'function') throw new TypeError('callback is not a function')
    queueMicrotask(() => callback(...rest))
}
