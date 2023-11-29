export function lazyObject<T extends object>(lazyInit: { [key in keyof T]: () => T[key] }): T {
    const object = {} as any
    const desc: any = {}
    for (const key in lazyInit) {
        desc[key] = {
            get: () => {
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

export function lazyProxy<T extends object>(lazyInit: () => T): T {
    const target = Object.create(null)
    const handler = new Proxy(target, {
        get() {
            Object.setPrototypeOf(target, lazyInit())
            Object.setPrototypeOf(handler2, null)
            return undefined
        },
    })
    const handler2 = Object.create(handler)
    return new Proxy(target, handler2)
}
