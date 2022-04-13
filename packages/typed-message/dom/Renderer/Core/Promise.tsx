import { memo, Suspense, useEffect, useState } from 'react'
import type { TypedMessagePromise } from '../../../base/index.js'
import { TypedMessageRenderInline } from '../Entry.js'
import { useTransformedValue } from '../utils/TransformContext.js'
export const TypedMessagePromiseRenderer = memo(function TypedMessagePromiseRenderer(props: TypedMessagePromise) {
    const { promise, alt } = props
    const _ = useState(0)[1]
    const rerender = () => _(Math.random())

    useEffect(() => {
        promise.then(rerender)
    }, [promise, _])

    const transformedValue = useTransformedValue(promise.value)
    if (transformedValue) return <TypedMessageRenderInline message={transformedValue} />
    return (
        <Suspense fallback={alt ? <TypedMessageRenderInline message={alt} /> : null}>
            <Await promise={promise} />
        </Suspense>
    )
})

function Await(props: { promise: Promise<any> }): JSX.Element {
    throw props.promise
}
