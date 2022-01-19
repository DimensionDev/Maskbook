import { memo, Suspense, useState } from 'react'
import type { TypedMessagePromise } from '../../../base'
import { TypedMessageRender, MessageRenderProps } from '../Entry'
import { useTransformedValue } from '../utils/TransformContext'
export const TypedMessagePromiseRenderer = memo(function TypedMessagePromiseRenderer(
    props: MessageRenderProps<TypedMessagePromise>,
) {
    const { promise, alt, value } = props.message
    const _ = useState(0)[1]
    const rerender = () => _(Math.random())

    const transformedValue = useTransformedValue(value)
    transformedValue && console.log(transformedValue)
    if (transformedValue) return <TypedMessageRender message={transformedValue} />
    return (
        <Suspense fallback={alt ? <TypedMessageRender message={alt} /> : null}>
            <Await promise={promise} rerender={rerender} />
        </Suspense>
    )
})

function Await(props: { promise: Promise<any>; rerender(): void }): JSX.Element {
    throw props.promise.then(props.rerender)
}
