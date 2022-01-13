import { memo, Suspense, useContext, useMemo } from 'react'
import type { TypedMessagePromise } from '../../../base'
import { TypedMessageRender, MessageRenderProps } from '../Entry'
import { TransformerContext } from '../utils/TransformContext'
export const TypedMessagePromiseRenderer = memo(function TypedMessagePromiseRenderer(
    props: MessageRenderProps<TypedMessagePromise>,
) {
    const { promise, alt, value } = props.message

    const transform = useContext(TransformerContext)
    const message2 = useMemo(() => (value ? transform(value) : undefined), [value, transform])

    if (message2) return <TypedMessageRender message={message2} />
    return (
        <Suspense fallback={alt ? <TypedMessageRender message={alt} /> : null}>
            <Await promise={promise} />
        </Suspense>
    )
})

function Await(props: { promise: Promise<any> }): JSX.Element {
    throw props.promise
}
