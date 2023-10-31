const cache = new WeakMap<object, object>()
/**
 * This function provides a localImplementation that has HMR support.
 * To update, call this function with the SAME key object.
 * @param impl The implementation. Can be an async function.
 * @param key The reference object that must be the same if you're updating.
 */
export async function getOrUpdateLocalImplementationHMR<T extends object>(impl: () => T | Promise<T>, key: object) {
    if (!import.meta.webpackHot) return impl()

    const result: any = await impl()
    if (!cache.has(key)) cache.set(key, Object.create(null))
    const localImpl = cache.get(key)
    Object.setPrototypeOf(localImpl, result)
    return localImpl
}
