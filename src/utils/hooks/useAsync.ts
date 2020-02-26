import { useEffect, useRef, MutableRefObject } from 'react'

const UNSET = Symbol('UNSET')

/** React hook for not-cancelable async calculation */
export function useAsync<T>(fn: () => PromiseLike<T>, dep: ReadonlyArray<unknown>): PromiseLike<T> {
    let res: Parameters<ConstructorParameters<typeof Promise>[0]>[0] = () => {}
    let rej: Parameters<ConstructorParameters<typeof Promise>[0]>[1] = () => {}
    const resResult: MutableRefObject<T | typeof UNSET> = useRef(UNSET)
    const rejResult: MutableRefObject<any | typeof UNSET> = useRef(UNSET)
    useEffect(() => {
        let unmounted = false
        fn().then(
            x => {
                if (!unmounted) {
                    resResult.current = x
                    res(x)
                }
            },
            err => {
                if (!unmounted) {
                    rejResult.current = err
                    rej(err)
                }
            },
        )
        return () => {
            unmounted = true
        }
        // eslint-disable-next-line
    }, dep)
    return {
        then(f, r) {
            if (resResult.current !== UNSET) {
                return Promise.resolve(f ? f(resResult.current) : resResult.current)
            }
            if (rejResult.current !== UNSET) {
                return r ? Promise.resolve(r(rejResult.current)) : Promise.reject(rejResult.current)
            }
            return new Promise<any>((resolve, reject) => {
                res = (val: any) => (f ? resolve(f(val)) : resolve(val))
                rej = (err: any) => (r ? resolve(r(err)) : reject(err))
            })
        },
    }
}
