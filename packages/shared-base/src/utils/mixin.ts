export function mixin<T, S1>(target: T, source1: S1): T & S1
export function mixin<T, S1, S2>(target: T, source1: S1, source2: S2): T & S1 & S2
export function mixin<T, S1, S2, S3>(target: T, source1: S1, source2: S2, source3: S3): T & S1 & S2 & S3
export function mixin<T, S1, S2, S3, S4>(
    target: T,
    source1: S1,
    source2: S2,
    source3: S3,
    source4: S4,
): T & S1 & S2 & S3 & S4
export function mixin<R>(...mixinTargets: any[]): R {
    if (mixinTargets.some((x) => typeof x !== 'object' || x === null))
        throw new TypeError('mixin() expects object arguments')
    const container = {
        __proto__: new Proxy(
            {},
            {
                get(_, key) {
                    if (key === '__proto__') return undefined
                    const mixinTarget = mixinTargets.find((x) => key in x)
                    if (!mixinTarget) return undefined
                    const mixinItem = mixinTarget[key]
                    if (typeof mixinItem === 'function')
                        // Note: not use .bind here because it will override the arguments for bound function.
                        return set(key, (...args: any[]) => Reflect.apply(mixinItem, mixinTarget, args))
                    return set(key, mixinItem)
                },
                has(_, key) {
                    return mixinTargets.some((x) => key in x)
                },
            },
        ),
    }
    function set(k: PropertyKey, value: unknown) {
        Object.defineProperty(container, k, { configurable: true, enumerable: true, value })
        return value
    }
    return new Proxy(container as any, traps)
}
const traps: ProxyHandler<any> = {
    getPrototypeOf: () => null,
    setPrototypeOf: (_, p) => p === null,
    getOwnPropertyDescriptor(container, key) {
        // trigger [[Get]]
        Reflect.get(container, key)
        return Reflect.getOwnPropertyDescriptor(container, key)
    },
    has(container, key) {
        return key in container
    },
}
