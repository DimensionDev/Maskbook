import { memo, useEffect, useRef } from 'react'
import type { TypedMessage } from '@masknet/typed-message'

/** @internal */
export const TypedMessageUnknownRender = memo(function TypedMessageUnknownRender(props: TypedMessage) {
    const warnedRef = useRef(false)
    useEffect(() => {
        if (warnedRef.current) return
        warnedRef.current = true
        console.warn(
            '[@masknet/typed-message] Trying to render an unknown TypedMessage (or a known TypedMessage with no renderer) with props',
            props,
        )
    })
    return null
})
