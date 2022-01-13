import { memo } from 'react'
import type { TypedMessageTuple } from '../../../base'
import type { MessageRenderProps } from '../Entry'
import { hasCircular } from '../utils/circularDetect'
import { TypedMessageRender } from '../Entry'

export const TypedMessageTupleRenderer = memo(function TypedMessageTupleRenderer(
    props: MessageRenderProps<TypedMessageTuple>,
) {
    if (hasCircular(props.message)) return null
    return (
        <>
            {props.message.items.map((message, index) => (
                <TypedMessageRender key={index} {...props} message={message} />
            ))}
        </>
    )
})
