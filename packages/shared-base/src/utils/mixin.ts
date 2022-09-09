export function mixin<T, S1>(target: T, source1: S1): T & S1;
export function mixin<T, S1, S2>(target: T, source1: S1, source2: S2): T & S1 & S2;
export function mixin<T, S1, S2, S3>(target: T, source1: S1, source2: S2, source3: S3): T & S1 & S2 & S3;
export function mixin<T, S1, S2, S3, S4>(target: T, source1: S1, source2: S2, source3: S3, source4: S4): T & S1 & S2 & S3 & S4;
export function mixin<R>(target: any, ...others: any[]): R {
    const all = [target, ...others]
    return new Proxy({}, {
        get(_, prop, receiver) {
            for (const source of all) {
                if (typeof source[prop] === 'function') return Reflect.get(source, prop, source).bind(source)
                if (typeof source[prop] !== 'undefined') return Reflect.get(source, prop, source)
                continue
            }
            return
        }
    }) as R
}
