import { memoize } from 'lodash-es'
/**
 * The promise version of lodash-es/memoize
 * @param f An async function
 * @param resolver If the function has 1 param, it can be undefined
 * as `x => x`. If it has more than 1 param, you must specify a function
 * to map the param the memoize key.
 */
export function memoizePromise<T extends (...args: Args) => Promise<any>, Args extends any[]>(
    f: T,
    resolver: Args[1] extends undefined ? undefined | ((...args: Args) => unknown) : (...args: Args) => unknown,
): T & { cache: Map<any, unknown> } {
    if (resolver === undefined) resolver = (<T>(x: T) => x) as unknown as typeof resolver
    const memorizedFunction = memoize(
        async function (...args: Args) {
            try {
                // ? DO NOT remove "await" here
                return await f(...args)
            } catch (e) {
                memorizedFunction.cache.delete(resolver!(...args))
                throw e
            }
        } as unknown as T,
        resolver,
    )
    return memorizedFunction as any
}
