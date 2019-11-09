/** This file is published under MIT License */
import * as React from 'react'

type PromiseState<T> =
    | { status: 'await' | 'not-started' }
    | { status: 'complete'; data: T }
    | { status: 'fail'; error: Error }
export default function AsyncComponent<Return>(props: {
    promise: () => Promise<Return>
    dependencies: ReadonlyArray<unknown>
    completeComponent: React.ComponentType<{ data: Return }> | React.ReactNode
    awaitingComponent: React.SuspenseProps['fallback']
    failedComponent: React.ComponentType<{ error: Error }> | React.ReactNode
}) {
    const [state, setState] = React.useState<PromiseState<Return>>({ status: 'not-started' })
    // eslint-disable-next-line
    const promise = React.useMemo(() => props.promise(), props.dependencies)
    if (state.status === 'not-started') {
        promise.then(
            data => setState({ status: 'complete', data }),
            error => setState({ status: 'fail', error }),
        )
        setState({ status: 'await' })
    }
    const Component = React.useMemo(
        () =>
            React.lazy(async () => {
                try {
                    const data = await promise
                    return {
                        default: () => {
                            const CompleteComponent = props.completeComponent
                            if (isComponent(CompleteComponent)) return <CompleteComponent data={data} />
                            else return (CompleteComponent as React.ReactElement) || null
                        },
                    }
                } catch (e) {
                    return {
                        default: () => {
                            const FailedComponent = props.failedComponent
                            if (isComponent(FailedComponent)) return <FailedComponent error={e} />
                            else return (FailedComponent as React.ReactElement) || null
                        },
                    }
                }
            }),
        // eslint-disable-next-line
        props.dependencies,
    )
    return (
        <React.Suspense fallback={props.awaitingComponent}>
            <Component />
        </React.Suspense>
    )
}

function isComponent<T>(f?: React.ComponentType<T> | NonNullable<React.ReactNode> | null): f is React.ComponentType<T> {
    return typeof f === 'function'
}

/** React hook for not-cancelable async calculation */
export function useAsync<T>(fn: () => PromiseLike<T>, dep: ReadonlyArray<unknown>): PromiseLike<T> {
    let res: Parameters<ConstructorParameters<typeof Promise>[0]>[0] = () => {},
        rej: Parameters<ConstructorParameters<typeof Promise>[0]>[1] = () => {}
    React.useEffect(() => {
        let unmounted = false
        fn().then(
            x => unmounted || res(x),
            err => unmounted || rej(err),
        )
        return () => {
            unmounted = true
        }
        // eslint-disable-next-line
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
