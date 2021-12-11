// key = channel; value = local implementation
const RPCCache = new WeakMap<object, object>()
/**
 * This function provides a localImplementation that is HMR ready.
 * To update, call this function with the SAME CHANNEL object.
 * It will "clone" all methods that impl returns.
 * @param isBackground If the current environment is background.
 * @param name The name of the local implementation, used for logging
 * @param impl The implementation. Can be an async function.
 * @param ref The reference object that must be the same if you're updating.
 */
export async function getLocalImplementation<T extends object>(
    isBackground: boolean,
    name: string,
    impl: () => T | Promise<T>,
    ref: object,
) {
    if (!isBackground) return {}

    const isUpdate = RPCCache.has(ref)
    const localImpl: T = RPCCache.get(ref) || ({} as any)
    RPCCache.set(ref, localImpl)

    const result: any = await impl()
    for (const key in localImpl) {
        if (!Reflect.has(result, key)) {
            delete localImpl[key]
            isUpdate && console.log(`[HMR] ${name}.${key} removed.`)
        } else if (result[key] !== localImpl[key]) {
            isUpdate && console.log(`[HMR] ${name}.${key} updated.`)
        }
    }
    for (const key in result) {
        if (key === 'then') console.error('!!! Do not use "then" as your method name !!!')
        if (!Reflect.has(localImpl, key)) isUpdate && console.log(`[HMR] ${name}.${key} added.`)
        Object.defineProperty(localImpl, key, { configurable: true, enumerable: true, value: result[key] })
    }
    return localImpl
}

export async function getLocalImplementationExotic<T extends object>(
    isBackground: boolean,
    name: string,
    impl: () => T | Promise<T>,
    ref: object,
) {
    if (!isBackground) return {}

    RPCCache.set(ref, await impl())
    return new Proxy(
        {},
        {
            get(_, key) {
                if (key === 'then') return
                // @ts-ignore
                return RPCCache.get(ref)?.[key]
            },
        },
    )
}
