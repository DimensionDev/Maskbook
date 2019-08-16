import { memoize } from 'lodash-es'
export function memoizePromise<T extends (...args: Args) => PromiseLike<any>, Args extends any[]>(
    f: T,
    resolver: (...args: Args) => any = ((a: any) => a) as any,
) {
    const memorizedFunction = memoize(async function(...args: Args) {
        try {
            // ? DO NOT remove "await" here
            return await f(...args)
        } catch (e) {
            memorizedFunction.cache.delete(resolver(...args))
            throw e
        }
    }, resolver)
    return memorizedFunction
}
