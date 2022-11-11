import type {} from 'react/next'
import { memo, Suspense, use } from 'react'
import type { TypedMessage, TypedMessagePromise } from '@masknet/typed-message'
import { TypedMessageRenderInline } from '../Entry.js'
import { useTransformedValue } from '../utils/TransformContext.js'

export const TypedMessagePromiseRender = memo(function TypedMessagePromiseRender(props: TypedMessagePromise) {
    const { promise, alt } = props
    return (
        <Suspense fallback={alt ? <TypedMessageRenderInline message={alt} /> : null}>
            <Await_new promise={promise} />
        </Suspense>
    )
})

function Await_new({ promise }: { promise: Promise<TypedMessage> }): JSX.Element {
    const resolved = use(promise)
    const transformedValue = useTransformedValue(resolved)
    return <TypedMessageRenderInline message={transformedValue} />
}
