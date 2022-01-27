import { memo, Suspense, useEffect, useState } from 'react'
import type { TypedMessagePromise } from '../../../base'
import { TypedMessageRender, MessageRenderProps } from '../Entry'
import { useTransformedValue } from '../utils/TransformContext'
export const TypedMessagePromiseRenderer = memo(function TypedMessagePromiseRenderer(
    props: MessageRenderProps<TypedMessagePromise>,
) {
    const { promise, alt } = props.message
    const _ = useState(0)[1]
    const rerender = () => _(Math.random())

    useEffect(() => {
        promise.then(rerender)
    }, [promise, _])

    const transformedValue = useTransformedValue(promise.value)
    transformedValue && console.log(transformedValue)
    if (transformedValue) return <TypedMessageRender message={transformedValue} />
    return (
        <Suspense fallback={alt ? <TypedMessageRender message={alt} /> : null}>
            <Await promise={promise} />
        </Suspense>
    )
})

function Await(props: { promise: Promise<any> }): JSX.Element {
    throw props.promise
}
