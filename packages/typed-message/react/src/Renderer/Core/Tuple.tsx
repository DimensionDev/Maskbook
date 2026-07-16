import { memo, useMemo } from 'react'
import { unstable_STYLE_META, type TypedMessageTuple } from '@masknet/typed-message'
import { hasCircular } from '../utils/circularDetect.js'
import { TypedMessageRenderInline } from '../Entry.js'
import { useMetadataRender } from '../MetadataRender.js'

export const TypedMessageTupleRender = memo(function TypedMessageTupleRender(props: TypedMessageTuple) {
    const meta = useMetadataRender(props)
    const containsCircular = useMemo(() => hasCircular(props.items), [props.items])
    if (containsCircular) return null

    return (
        <span style={new Object(props.meta?.get(unstable_STYLE_META))}>
            {props.items.map((message, index) => (
                <TypedMessageRenderInline key={index} {...props} message={message} />
            ))}
            {meta}
        </span>
    )
})
