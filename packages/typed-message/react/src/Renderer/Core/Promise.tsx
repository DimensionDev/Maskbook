import * as React from 'react'
import { memo, Suspense, useEffect, useState } from 'react'
import type { TypedMessage, TypedMessagePromise } from '@masknet/typed-message'
import { TypedMessageRenderInline } from '../Entry.js'
import { useTransformedValue } from '../utils/TransformContext.js'

export const TypedMessagePromiseRender = memo(
    'use' in React ?
        function TypedMessagePromiseRender(props: TypedMessagePromise) {
            const { promise, alt } = props
            return (
                <Suspense fallback={alt ? <TypedMessageRenderInline message={alt} /> : null}>
                    <Await_new promise={promise} />
                </Suspense>
            )
        }
    :   function TypedMessagePromiseRender(props: TypedMessagePromise) {
            const { promise, alt } = props

            const _ = useState(0)[1]
            const rerender = () => _(Math.random())

            useEffect(() => {
                promise.then(rerender)
            }, [promise, _])

            const transformedValue = useTransformedValue('value' in promise ? promise.value : undefined)
            if (transformedValue) return <TypedMessageRenderInline message={transformedValue} />

            return (
                <Suspense fallback={alt ? <TypedMessageRenderInline message={alt} /> : null}>
                    <Await_old promise={promise} />
                </Suspense>
            )
        },
)

function Await_new({ promise }: { promise: Promise<TypedMessage> }): JSX.Element {
    const resolved = Reflect.get(React, 'use')(promise)
    const transformedValue = useTransformedValue(resolved)
    return <TypedMessageRenderInline message={transformedValue} />
}

function Await_old({ promise }: { promise: Promise<TypedMessage> }): JSX.Element {
    throw promise
}
