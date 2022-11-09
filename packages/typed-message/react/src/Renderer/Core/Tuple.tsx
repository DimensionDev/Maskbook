import { memo, useMemo } from 'react'
import type { TypedMessageTuple } from '@masknet/typed-message'
import { hasCircular } from '../utils/circularDetect.js'
import { TypedMessageRenderInline } from '../Entry.js'
import { useMetadataRender } from '../MetadataRender.js'

// TODO: remove this after we switch to inline rendering of Mask payload.
export const unstable_TUPLE_RENDER_STYLE = 'unstable_TUPLE_RENDER_STYLE'
export const TypedMessageTupleRender = memo(function TypedMessageTupleRender(props: TypedMessageTuple) {
    const meta = useMetadataRender(props)
    if (useMemo(() => hasCircular(props.items), [props.items])) return null

    return (
        <span style={Object(props.meta?.get(unstable_TUPLE_RENDER_STYLE))}>
            {props.items.map((message, index) => (
                <TypedMessageRenderInline key={index} {...props} message={message} />
            ))}
            {meta}
        </span>
    )
})
