import { memo } from 'react'
import type { TypedMessageTuple } from '../../../base'
import { hasCircular } from '../utils/circularDetect'
import { TypedMessageRender } from '../Entry'

export const TypedMessageTupleRenderer = memo(function TypedMessageTupleRenderer(props: TypedMessageTuple) {
    if (hasCircular(props)) return null
    return (
        <>
            {props.items.map((message, index) => (
                <TypedMessageRender key={index} {...props} message={message} />
            ))}
        </>
    )
})
