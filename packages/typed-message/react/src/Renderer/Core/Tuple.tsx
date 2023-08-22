import { memo, useMemo } from 'react'
import { unstable_STYLE_META, type TypedMessageTuple } from '@masknet/typed-message'
import { hasCircular } from '../utils/circularDetect.js'
import { TypedMessageRenderInline } from '../Entry.js'
import { useMetadataRender } from '../MetadataRender.js'

export const TypedMessageTupleRender = memo(function TypedMessageTupleRender(props: TypedMessageTuple) {
    const meta = useMetadataRender(props)
    if (useMemo(() => hasCircular(props.items), [props.items])) return null

    return (
        <span style={Object(props.meta?.get(unstable_STYLE_META))}>
            {props.items.map((message, index) => (
                <TypedMessageRenderInline key={index} {...props} message={message} />
            ))}
            {meta}
        </span>
    )
})
