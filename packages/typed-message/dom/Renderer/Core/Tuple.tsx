import { memo, useMemo } from 'react'
import type { TypedMessageTuple } from '../../../base'
import { hasCircular } from '../utils/circularDetect'
import { TypedMessageRenderInline } from '../Entry'
import { useMetadataRender } from '../MetadataRender'

// TODO: remove this after we switch to inline rendering of Mask payload.
export const TUPLE_RENDER_STYLE = 'TUPLE_RENDER_STYLE'
export const TypedMessageTupleRenderer = memo(function TypedMessageTupleRenderer(props: TypedMessageTuple) {
    const meta = useMetadataRender(props)
    if (useMemo(() => hasCircular(props.items), [props.items])) return null

    return (
        <span style={Object(props.meta?.get(TUPLE_RENDER_STYLE))}>
            {props.items.map((message, index) => (
                <TypedMessageRenderInline key={index} {...props} message={message} />
            ))}
            {meta}
        </span>
    )
})
