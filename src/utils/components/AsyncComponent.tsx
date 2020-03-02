/** This file is published under MIT License */
import * as React from 'react'

type PromiseState<T> =
    | { status: 'await' | 'not-started' }
    | { status: 'complete'; data: T }
    | { status: 'fail'; error: Error }
export default function AsyncComponent<Return>(props: {
    promise: () => Promise<Return>
    dependencies: ReadonlyArray<unknown>
    completeComponent: React.ComponentType<{ data: Return }> | null
    awaitingComponent: React.SuspenseProps['fallback']
    failedComponent: React.ComponentType<{ error: Error }> | null
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
                            return CompleteComponent ? <CompleteComponent data={data} /> : null
                        },
                    }
                } catch (e) {
                    return {
                        default: () => {
                            const FailedComponent = props.failedComponent
                            return FailedComponent ? <FailedComponent error={e} /> : null
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
