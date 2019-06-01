/** This file is published under MIT License */
import * as React from 'react'

type PromiseState<T> =
    | { status: 'await' | 'not-started' }
    | { status: 'complete'; data: T }
    | { status: 'fail'; error: Error }
export default function AsyncComponent<Return>(props: {
    promise: () => Promise<Return>
    dependencies: any[]
    completeComponent: React.ComponentType<{ data: Return }>
    awaitingComponent: React.SuspenseProps['fallback']
    failedComponent: React.ComponentType<{ error: Error }>
}) {
    const [state, setState] = React.useState<PromiseState<Return>>({ status: 'not-started' })
    const promise = React.useMemo(() => props.promise(), props.dependencies)
    if (state.status === 'not-started') {
        promise.then(data => setState({ status: 'complete', data }), error => setState({ status: 'fail', error }))
        setState({ status: 'await' })
    }
    const Component = React.useMemo(
        () =>
            React.lazy(async () => {
                try {
                    const data = await promise
                    return { default: () => <props.completeComponent data={data} /> }
                } catch (e) {
                    return { default: () => <props.failedComponent error={e} /> }
                }
            }),
        props.dependencies,
    )
    return (
        <React.Suspense fallback={props.awaitingComponent}>
            <Component />
        </React.Suspense>
    )
}

/** React hook for not-cancelable async calculation */
export function useAsync<T>(fn: () => Promise<T>, dep?: ReadonlyArray<any>): PromiseLike<T> {
    let res: any, rej: any
    React.useLayoutEffect(() => {
        let unmounted = false
        fn().then(x => unmounted || res(x), err => unmounted || rej(err))
        return () => {
            unmounted = true
        }
    }, dep)
    return {
        then(f, r) {
            return new Promise<any>((resolve, reject) => {
                res = (val: any) => (f ? resolve(f(val)) : resolve(val))
                rej = (err: any) => (r ? resolve(r(err)) : reject(err))
            })
        },
    }
}
