export function lazyObject<T extends object>(lazyInit: { [key in keyof T]: () => T[key] }): T {
    const object = {} as any
    const desc: any = {}
    for (const key in lazyInit) {
        // eslint-disable-next-line unicorn/no-unsafe-property-key
        desc[key] = {
            get: () => {
                // eslint-disable-next-line unicorn/no-unsafe-property-key
                const value = lazyInit[key]()
                Object.defineProperty(object, key, {
                    value,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                })
                return value
            },
            configurable: true,
            enumerable: true,
        }
    }
    Object.defineProperties(object, desc)
    return object
}
